namespace CATnTRACE_API.Model
{
    public class OrderTrackingStatus
    {
        public string PK { get; set; }
        public DateTime OrderDateTime { get; set; }
        public DateTime PlannedStartDate { get; set; }
        public DateTime ActulStartDate { get; set; }
        public string OrderStatus { get; set; }
        public string SiteName { get; set; }
        public string ParcelNumber { get; set; }
    }
}
