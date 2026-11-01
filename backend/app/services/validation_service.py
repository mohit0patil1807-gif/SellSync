from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from app.models.validation import CustomerInterview, BusinessAssumption, ValidationExperiment
from app.schemas.validation import (
    CustomerInterviewCreate,
    CustomerInterviewUpdate,
    ValidationDashboardStats,
    SegmentStat,
    ProblemStat,
    FeatureStat,
    BusinessAssumptionCreate,
    BusinessAssumptionUpdate,
    ValidationExperimentCreate,
    ValidationExperimentUpdate,
    BreakEvenCalculationRequest,
    BreakEvenCalculationResponse
)
from typing import List, Optional, Dict
import math

class ValidationService:
    # ----------------- Customer Interviews -----------------
    @staticmethod
    def get_interviews(db: Session) -> List[CustomerInterview]:
        return db.query(CustomerInterview).order_by(CustomerInterview.created_at.desc()).all()

    @staticmethod
    def get_interview_by_id(db: Session, interview_id: int) -> Optional[CustomerInterview]:
        return db.query(CustomerInterview).filter(CustomerInterview.id == interview_id).first()

    @staticmethod
    def create_interview(db: Session, interview_in: CustomerInterviewCreate) -> CustomerInterview:
        interview = CustomerInterview(
            seller_name=interview_in.seller_name,
            seller_type=interview_in.seller_type,
            sales_channels=interview_in.sales_channels,
            approx_order_volume=interview_in.approx_order_volume,
            current_process=interview_in.current_process,
            most_time_consuming_task=interview_in.most_time_consuming_task,
            current_tools=interview_in.current_tools,
            operational_mistakes=interview_in.operational_mistakes,
            most_requested_feature=interview_in.most_requested_feature,
            willingness_to_pilot=interview_in.willingness_to_pilot,
            pricing_feedback=interview_in.pricing_feedback,
            follow_up_notes=interview_in.follow_up_notes,
            interview_date=datetime.utcnow(),
        )
        db.add(interview)
        db.commit()
        db.refresh(interview)
        return interview

    @staticmethod
    def update_interview(db: Session, interview_id: int, update_in: CustomerInterviewUpdate) -> Optional[CustomerInterview]:
        interview = db.query(CustomerInterview).filter(CustomerInterview.id == interview_id).first()
        if not interview:
            return None
        
        update_data = update_in.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(interview, key, value)
            
        db.commit()
        db.refresh(interview)
        return interview

    @staticmethod
    def delete_interview(db: Session, interview_id: int) -> bool:
        interview = db.query(CustomerInterview).filter(CustomerInterview.id == interview_id).first()
        if not interview:
            return False
        db.delete(interview)
        db.commit()
        return True

    @staticmethod
    def get_validation_stats(db: Session) -> ValidationDashboardStats:
        interviews = db.query(CustomerInterview).all()
        total = len(interviews)

        if total == 0:
            return ValidationDashboardStats(
                total_interviews=0,
                segments_represented=[],
                frequent_problems=[],
                requested_features=[],
                pilot_interested_count=0,
                pilot_percentage=0.0,
                pricing_summaries=[]
            )

        # Segments count
        segment_counts: Dict[str, int] = {}
        for it in interviews:
            seg = it.seller_type.strip()
            segment_counts[seg] = segment_counts.get(seg, 0) + 1

        segments_list = [SegmentStat(segment=k, count=v) for k, v in sorted(segment_counts.items(), key=lambda x: x[1], reverse=True)]

        # Problem counts
        problem_counts: Dict[str, int] = {}
        for it in interviews:
            prob = it.most_time_consuming_task.strip()
            problem_counts[prob] = problem_counts.get(prob, 0) + 1

        problems_list = [ProblemStat(problem=k, count=v) for k, v in sorted(problem_counts.items(), key=lambda x: x[1], reverse=True)]

        # Feature requests
        feature_counts: Dict[str, int] = {}
        for it in interviews:
            feat = it.most_requested_feature.strip()
            feature_counts[feat] = feature_counts.get(feat, 0) + 1

        features_list = [FeatureStat(feature=k, count=v) for k, v in sorted(feature_counts.items(), key=lambda x: x[1], reverse=True)]

        # Pilot interest
        pilot_count = sum(1 for it in interviews if it.willingness_to_pilot)
        pilot_pct = round((pilot_count / total) * 100, 1)

        # Pricing feedback list (non-empty only)
        pricing_summaries = [it.pricing_feedback for it in interviews if it.pricing_feedback and it.pricing_feedback.strip()]

        return ValidationDashboardStats(
            total_interviews=total,
            segments_represented=segments_list,
            frequent_problems=problems_list,
            requested_features=features_list,
            pilot_interested_count=pilot_count,
            pilot_percentage=pilot_pct,
            pricing_summaries=pricing_summaries
        )

    # ----------------- Business Assumptions -----------------
    @staticmethod
    def get_assumptions(db: Session) -> List[BusinessAssumption]:
        assumptions = db.query(BusinessAssumption).order_by(BusinessAssumption.id.asc()).all()
        if len(assumptions) == 0:
            ValidationService.seed_default_assumptions(db)
            assumptions = db.query(BusinessAssumption).order_by(BusinessAssumption.id.asc()).all()
        return assumptions

    @staticmethod
    def create_assumption(db: Session, assumption_in: BusinessAssumptionCreate) -> BusinessAssumption:
        assumption = BusinessAssumption(
            assumption_code=assumption_in.assumption_code,
            description=assumption_in.description,
            category=assumption_in.category,
            evidence_available=assumption_in.evidence_available,
            confidence_level=assumption_in.confidence_level,
            validation_method=assumption_in.validation_method,
            status=assumption_in.status,
            next_action=assumption_in.next_action,
        )
        db.add(assumption)
        db.commit()
        db.refresh(assumption)
        return assumption

    @staticmethod
    def update_assumption(db: Session, assumption_id: int, update_in: BusinessAssumptionUpdate) -> Optional[BusinessAssumption]:
        assumption = db.query(BusinessAssumption).filter(BusinessAssumption.id == assumption_id).first()
        if not assumption:
            return None
        
        update_data = update_in.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(assumption, key, value)
            
        assumption.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(assumption)
        return assumption

    @staticmethod
    def seed_default_assumptions(db: Session):
        defaults = [
            {
                "assumption_code": "ASM-01",
                "description": "Small sellers using multiple channels spend significant daily effort copying customer details and cross-checking payments.",
                "category": "Problem",
                "evidence_available": "Hypothesis to be tested. No customer interviews recorded yet in this workspace.",
                "confidence_level": "Low",
                "validation_method": "Semi-structured seller discovery interviews & workflow timing observation.",
                "status": "Untested",
                "next_action": "Conduct and log first customer discovery interviews with micro-sellers."
            },
            {
                "assumption_code": "ASM-02",
                "description": "Centralized inventory reservation reduces accidental overselling conflicts between messaging chats and marketplace listings.",
                "category": "Solution",
                "evidence_available": "Hypothesis based on problem observation. Requires validation via seller prototype trial.",
                "confidence_level": "Low",
                "validation_method": "Pilot test with micro-sellers tracking stock discrepancy occurrences before and after.",
                "status": "Untested",
                "next_action": "Demonstrate unified catalog reservation workflow during discovery sessions."
            },
            {
                "assumption_code": "ASM-03",
                "description": "Micro-sellers are willing to pay ₹299–₹799/month for an integrated operations management platform.",
                "category": "Willingness to Pay",
                "evidence_available": "Hypothetical pricing benchmarked against comparable SaaS tools. No paying commitments recorded.",
                "confidence_level": "Low",
                "validation_method": "Van Westendorp Price Sensitivity questions during discovery interviews.",
                "status": "Untested",
                "next_action": "Ask direct willingness-to-pay questions during interviews."
            },
            {
                "assumption_code": "ASM-04",
                "description": "A focused initial set of core channels (WhatsApp, Instagram, Meesho/Amazon) covers the majority of target micro-seller orders.",
                "category": "Feasibility",
                "evidence_available": "Hypothesis based on informal market scans. Exact channel distribution to be determined from logged interviews.",
                "confidence_level": "Low",
                "validation_method": "Sales channel distribution analysis across recorded seller interviews.",
                "status": "Untested",
                "next_action": "Record sales channel breakdown in interview log."
            },
            {
                "assumption_code": "ASM-05",
                "description": "Small sellers prefer a mobile-friendly lightweight dashboard with plain language over complex enterprise ERP software.",
                "category": "Solution",
                "evidence_available": "Hypothesis based on mobile-first usage in India. To be validated with usability feedback.",
                "confidence_level": "Low",
                "validation_method": "Usability test with 'Today' cockpit and plain-language action cards.",
                "status": "Untested",
                "next_action": "Gather feedback on simplified vocabulary vs standard technical terms."
            }
        ]

        for d in defaults:
            existing = db.query(BusinessAssumption).filter(BusinessAssumption.assumption_code == d["assumption_code"]).first()
            if not existing:
                asm = BusinessAssumption(**d)
                db.add(asm)
        db.commit()

    # ----------------- Validation Experiments -----------------
    @staticmethod
    def get_experiments(db: Session) -> List[ValidationExperiment]:
        experiments = db.query(ValidationExperiment).order_by(ValidationExperiment.id.asc()).all()
        if len(experiments) == 0:
            ValidationService.seed_default_experiments(db)
            experiments = db.query(ValidationExperiment).order_by(ValidationExperiment.id.asc()).all()
        return experiments

    @staticmethod
    def create_experiment(db: Session, experiment_in: ValidationExperimentCreate) -> ValidationExperiment:
        exp = ValidationExperiment(
            experiment_code=experiment_in.experiment_code,
            hypothesis=experiment_in.hypothesis,
            target_segment=experiment_in.target_segment,
            experiment_description=experiment_in.experiment_description,
            success_metric=experiment_in.success_metric,
            target_threshold=experiment_in.target_threshold,
            actual_result=experiment_in.actual_result,
            decision=experiment_in.decision,
            next_action=experiment_in.next_action,
        )
        db.add(exp)
        db.commit()
        db.refresh(exp)
        return exp

    @staticmethod
    def update_experiment(db: Session, experiment_id: int, update_in: ValidationExperimentUpdate) -> Optional[ValidationExperiment]:
        exp = db.query(ValidationExperiment).filter(ValidationExperiment.id == experiment_id).first()
        if not exp:
            return None
        
        update_data = update_in.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(exp, key, value)
            
        exp.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(exp)
        return exp

    @staticmethod
    def seed_default_experiments(db: Session):
        defaults = [
            {
                "experiment_code": "EXP-01",
                "hypothesis": "Small multi-channel sellers find a unified order inbox faster and less error-prone than switching between individual seller applications.",
                "target_segment": "Multi-channel apparel and home boutique sellers",
                "experiment_description": "Ask 8 sellers to process 5 multi-channel incoming orders (verify payment, prepare label, update inventory) using their current manual method vs. the SellSync prototype.",
                "success_metric": "Task completion duration, number of tab/app switches, and subjective ease-of-use rating (1-5).",
                "target_threshold": "At least 50% reduction in order processing time and >= 6 out of 8 sellers prefer SellSync.",
                "actual_result": None,
                "decision": "Pending",
                "next_action": "Schedule testing sessions with 8 recruited sellers from local merchant communities."
            },
            {
                "experiment_code": "EXP-02",
                "hypothesis": "Sellers will commit to a 30-day paid pilot if offered automated WhatsApp dispatch tracking notifications.",
                "target_segment": "Instagram and WhatsApp direct merchants",
                "experiment_description": "Present the interactive tracking notification preview and ask sellers if they would pay ₹299/month for this feature as part of Starter tier.",
                "success_metric": "Percentage of interviewed sellers signing up for priority pilot access.",
                "target_threshold": ">= 40% of interviewed sellers indicate willingness to pay ₹299/mo.",
                "actual_result": None,
                "decision": "Pending",
                "next_action": "Include tracking notification value test in the upcoming 10 interviews."
            }
        ]

        for d in defaults:
            existing = db.query(ValidationExperiment).filter(ValidationExperiment.experiment_code == d["experiment_code"]).first()
            if not existing:
                exp = ValidationExperiment(**d)
                db.add(exp)
        db.commit()

    # ----------------- Break-Even Calculator Logic -----------------
    @staticmethod
    def calculate_break_even(req: BreakEvenCalculationRequest) -> BreakEvenCalculationResponse:
        rev_per_seller = max(0.0, float(req.avg_monthly_rev_per_seller))
        var_cost = max(0.0, float(req.variable_cost_per_seller))
        fixed_costs = max(0.0, float(req.monthly_fixed_operating_costs))
        customers_count = max(0, int(req.selected_customers_count))

        # Contribution per seller = monthly revenue per seller - variable cost per seller
        contribution = round(rev_per_seller - var_cost, 2)
        margin_pct = round((contribution / rev_per_seller * 100), 1) if rev_per_seller > 0 else 0.0

        # Break-even paying customers = monthly fixed operating costs / contribution per seller
        if contribution > 0:
            break_even_customers = math.ceil(fixed_costs / contribution)
        else:
            break_even_customers = 0 # Cannot break even if contribution is <= 0

        # Performance at selected customer count
        revenue_at_count = round(customers_count * rev_per_seller, 2)
        var_cost_at_count = round(customers_count * var_cost, 2)
        total_cost_at_count = round(fixed_costs + var_cost_at_count, 2)
        surplus_deficit = round(revenue_at_count - total_cost_at_count, 2)

        if surplus_deficit > 0:
            status = "SURPLUS"
        elif surplus_deficit < 0:
            status = "DEFICIT"
        else:
            status = "BREAK_EVEN"

        return BreakEvenCalculationResponse(
            monthly_rev_per_seller=rev_per_seller,
            variable_cost_per_seller=var_cost,
            contribution_per_seller=contribution,
            contribution_margin_percentage=margin_pct,
            fixed_costs=fixed_costs,
            break_even_customers=break_even_customers,
            revenue_at_selected_count=revenue_at_count,
            variable_cost_at_selected_count=var_cost_at_count,
            total_cost_at_selected_count=total_cost_at_count,
            operating_surplus_deficit=surplus_deficit,
            status=status,
            is_illustrative_assumption=True
        )
