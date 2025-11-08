namespace PaymentApi.Dtos
{
    public class CreatePaymentDto
    {
        // Optional: frontend may send an orderId; include it so we can persist the same value.
        public string OrderId { get; set; }

        public string ItemName { get; set; }
        public decimal Amount { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
    }
}
