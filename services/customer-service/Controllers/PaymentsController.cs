using Microsoft.AspNetCore.Mvc;
using PaymentApi.Data;
using PaymentApi.Models;
using PaymentApi.Dtos;

namespace PaymentApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PaymentsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("create")]
        public IActionResult CreatePayment([FromBody] CreatePaymentDto dto)
        {
            if (dto == null)
                return BadRequest("Invalid payment data.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var payment = new Payment
            {
                OrderId = string.IsNullOrWhiteSpace(dto.OrderId) ? Guid.NewGuid().ToString() : dto.OrderId,
                ItemName = dto.ItemName,
                Amount = dto.Amount,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address,
                City = dto.City,
                Country = dto.Country
            };

            try
            {
                _context.Payments.Add(payment);
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                // Return a 500 with the error message (useful for dev debugging)
                return Problem(detail: ex.Message, statusCode: 500);
            }

            // Mock PayHere redirect (for now)
            return Ok(new
            {
                url = "https://sandbox.payhere.lk/pay/checkout",
                data = new
                {
                    merchant_id = "1212345",
                    return_url = "http://localhost:5173/success",
                    cancel_url = "http://localhost:5173/cancel",
                    notify_url = "http://localhost:5009/api/payments/notify",
                    order_id = payment.OrderId,
                    items = payment.ItemName,
                    amount = payment.Amount,
                    currency = "LKR",
                    first_name = payment.FirstName,
                    last_name = payment.LastName,
                    email = payment.Email,
                    phone = payment.Phone,
                    address = payment.Address,
                    city = payment.City,
                    country = payment.Country
                }
            });
        }
    }
}
