namespace TimeTracker.GraphQL.Types.Vacation
{
    public class ApproversReaction
    {
        public bool IsAllApproverReacted { get; set; }
        public bool? FinalApproversReaction { get; set; } = null;
        public ApproversReaction() { }
        public ApproversReaction(bool isAllApproverReacted)
        {
            IsAllApproverReacted = isAllApproverReacted;
        }
        public ApproversReaction(bool isAllApproverReacted, bool finalApproversReaction)
        {
            IsAllApproverReacted = isAllApproverReacted;
            FinalApproversReaction = finalApproversReaction;
        }
    }
}
