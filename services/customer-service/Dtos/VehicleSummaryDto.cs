namespace PaymentApi.Dtos
{
    /// <summary>
    /// DTO for vehicle summary in customer vehicle list
    /// </summary>
    public class VehicleSummaryDto
    {
        public string vehicleId { get; set; }
        public string noPlate { get; set; }
        public string vehicleBrand { get; set; }
        public string vehicleModel { get; set; }
    }
}
