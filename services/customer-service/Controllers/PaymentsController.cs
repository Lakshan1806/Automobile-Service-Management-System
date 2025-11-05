using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PaymentApi.Data;
using PaymentApi.Dtos;
using PaymentApi.Models;

namespace PaymentApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PaymentsController> _logger;
        private readonly IConfiguration _config;

        public PaymentsController(AppDbContext context, ILogger<PaymentsController> logger, IConfiguration config)
        {
            _context = context;
            _logger = logger;
            _config = config;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentDto dto)
        {
            if (dto == null) return BadRequest("Invalid payment data.");
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var payment = new Payment
            {
                OrderId = string.IsNullOrWhiteSpace(dto.OrderId) ? "ORDER-" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() : dto.OrderId,
                ItemName = dto.ItemName,
                Amount = dto.Amount,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address,
                City = dto.City,
                Country = dto.Country,
                Status = "Pending"
            };

            try
            {
                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving payment");
                return Problem(detail: ex.Message, statusCode: 500);
            }

            // Configuration / defaults
            var merchantId = _config.GetValue<string>("PayHere:MerchantId") ?? "1232662";
            var merchantSecret = _config.GetValue<string>("PayHere:MerchantSecret") ?? "NDE0ODIzMzMxOTY0ODYxODM0MDQwNzkxMTU3ODgzMzAyMTk5NDk0";
            var checkoutUrl = _config.GetValue<string>("PayHere:SandboxUrl") ?? "https://sandbox.payhere.lk/pay/checkout";
            var notifyUrl = _config.GetValue<string>("PayHere:NotifyUrl") ?? "http://localhost:5009/api/payments/notify";
            var returnUrl = _config.GetValue<string>("PayHere:ReturnUrl") ?? "http://localhost:5173/success";
            var cancelUrl = _config.GetValue<string>("PayHere:CancelUrl") ?? "http://localhost:5173/cancel";

            string currency = "LKR";
            string amountFormatted = payment.Amount.ToString("0.00", CultureInfo.InvariantCulture);

            // PayHere hash: md5( merchant_id + order_id + amount + currency + md5(merchant_secret) )
            var hashedSecret = CreateMD5(merchantSecret).ToUpperInvariant();
            var hash = CreateMD5(merchantId + payment.OrderId + amountFormatted + currency + hashedSecret).ToUpperInvariant();

            var payload = new Dictionary<string, string>
            {
                ["merchant_id"] = merchantId,
                ["return_url"] = returnUrl,
                ["cancel_url"] = cancelUrl,
                ["notify_url"] = notifyUrl,
                ["order_id"] = payment.OrderId,
                ["items"] = payment.ItemName,
                ["amount"] = amountFormatted,
                ["currency"] = currency,
                ["first_name"] = payment.FirstName,
                ["last_name"] = payment.LastName,
                ["email"] = payment.Email,
                ["phone"] = payment.Phone,
                ["address"] = payment.Address,
                ["city"] = payment.City,
                ["country"] = payment.Country,
                ["hash"] = hash,
                ["md5sig"] = hash
            };

            var referenceId = Guid.NewGuid().ToString();
            _logger.LogInformation("Created payment request {ReferenceId} OrderId={OrderId} Payload={Payload}", referenceId, payment.OrderId, payload);

            // Print critical values for local verification
            Console.WriteLine($"merchant_id={merchantId}");
            Console.WriteLine($"order_id={payment.OrderId}");
            Console.WriteLine($"amount={amountFormatted}");
            Console.WriteLine($"hash={hash}");

            return Ok(new { url = checkoutUrl, data = payload, referenceId });
        }

        [HttpGet("redirect/{orderId}")]
        public IActionResult RedirectToGateway(string orderId)
        {
            var payment = _context.Payments.FirstOrDefault(p => p.OrderId == orderId);
            if (payment == null) return NotFound("order not found");

            var merchantId = _config.GetValue<string>("PayHere:MerchantId") ?? "1232662";
            var merchantSecret = _config.GetValue<string>("PayHere:MerchantSecret") ?? "";
            var checkoutUrl = _config.GetValue<string>("PayHere:SandboxUrl") ?? "https://sandbox.payhere.lk/pay/checkout";

            string currency = "LKR";
            string amountFormatted = payment.Amount.ToString("0.00", CultureInfo.InvariantCulture);
            string hash = CreateMD5(merchantId + payment.OrderId + amountFormatted + currency + CreateMD5(merchantSecret)).ToLowerInvariant();

            var fields = new Dictionary<string, string>
            {
                { "merchant_id", merchantId },
                { "return_url", _config.GetValue<string>("PayHere:ReturnUrl") ?? "http://localhost:5173/success" },
                { "cancel_url", _config.GetValue<string>("PayHere:CancelUrl") ?? "http://localhost:5173/cancel" },
                { "notify_url", _config.GetValue<string>("PayHere:NotifyUrl") ?? "http://localhost:5009/api/payments/notify" },
                { "order_id", payment.OrderId },
                { "items", payment.ItemName },
                { "amount", amountFormatted },
                { "currency", currency },
                { "first_name", payment.FirstName },
                { "last_name", payment.LastName },
                { "email", payment.Email },
                { "phone", payment.Phone },
                { "address", payment.Address },
                { "city", payment.City },
                { "country", payment.Country },
                { "hash", hash },
                { "md5sig", hash }
            };

            var sb = new StringBuilder();
            sb.AppendLine("<html><head><meta charset=\"utf-8\"/><title>PayHere Redirect</title></head><body style=\"font-family:Segoe UI,Arial,sans-serif;padding:20px\">");
            sb.AppendLine("<h2>PayHere Sandbox Redirect</h2>");
            sb.AppendLine("<p>This page will send a test payment request to the PayHere sandbox. Use one of the test card numbers below on the PayHere checkout page.</p>");
            sb.AppendLine("<section style=\"margin:12px 0;padding:12px;border:1px solid #ddd;background:#f9f9f9\">\n<h3>Test cards (approved)</h3>\n<ul>\n<li>Visa: <strong>4916 2175 0161 1292</strong></li>\n<li>MasterCard: <strong>5307 7321 2553 1191</strong></li>\n<li>AMEX: <strong>3467 8100 5510 225</strong></li>\n<li>Also accepted: <strong>4242 4242 4242 4242</strong> (common test Visa)</li>\n</ul>\n<p>Use any future expiry date and any 3-digit CVV (4-digit for AMEX).</p>\n</section>");
            sb.AppendLine("<p>If you want to test specific decline scenarios, use the special test cards provided by your gateway (they return specific decline codes). Copy them before proceeding.</p>");
            sb.AppendLine($"<form id=\"payhere_form\" method=\"post\" action=\"{checkoutUrl}\">\n");
            foreach (var kv in fields)
            {
                var escaped = System.Net.WebUtility.HtmlEncode(kv.Value ?? string.Empty);
                sb.AppendLine($"<input type=\"hidden\" name=\"{kv.Key}\" value=\"{escaped}\" />\n");
            }
            sb.AppendLine("<div style=\"margin-top:16px\"><button id=\"proceed\" type=\"button\" style=\"padding:10px 16px;font-size:16px\">Proceed to PayHere Sandbox</button></div>");
            sb.AppendLine("</form>");
            sb.AppendLine("<script>document.getElementById('proceed').addEventListener('click', function(){document.getElementById('payhere_form').submit();});</script>");
            sb.AppendLine("</body></html>");

            return Content(sb.ToString(), "text/html");
        }

        [HttpPost("notify")]
        public async Task<IActionResult> Notify([FromForm] IDictionary<string, string> form)
        {
            var referenceId = Guid.NewGuid().ToString();
            _logger.LogInformation("Received notify {ReferenceId} Payload={Payload}", referenceId, form);

            if (!form.TryGetValue("order_id", out var orderId))
            {
                _logger.LogWarning("Notify {ReferenceId} missing order_id", referenceId);
                return BadRequest(new { message = "missing order_id", referenceId });
            }

            var payment = _context.Payments.FirstOrDefault(p => p.OrderId == orderId);
            if (payment == null)
            {
                _logger.LogWarning("Notify {ReferenceId} order not found {OrderId}", referenceId, orderId);
                return NotFound(new { message = "order not found", orderId, referenceId });
            }

            form.TryGetValue("md5sig", out var providedSig);

            var merchantSecret = _config.GetValue<string>("PayHere:MerchantSecret") ?? string.Empty;
            var merchantId = _config.GetValue<string>("PayHere:MerchantId") ?? "";

            var amount = form.TryGetValue("amount", out var a) ? a : payment.Amount.ToString("0.00", CultureInfo.InvariantCulture);
            var currency = form.TryGetValue("currency", out var c) ? c : "LKR";

            var expected = CreateMD5(merchantId + orderId + amount + currency + CreateMD5(merchantSecret)).ToUpperInvariant();

            if (string.IsNullOrEmpty(providedSig) || !string.Equals(expected, providedSig, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Notify {ReferenceId} signature mismatch OrderId={OrderId} Provided={Provided} Expected={Expected}", referenceId, orderId, providedSig, expected);
                return Unauthorized(new { message = "signature mismatch", referenceId });
            }

            if (form.TryGetValue("status", out var status)) payment.Status = status;
            if (form.TryGetValue("payment_id", out var txn)) payment.GatewayTransactionId = txn;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Notify {ReferenceId} processed OrderId={OrderId} Status={Status}", referenceId, orderId, payment.Status);
            return Ok("OK");
        }

        private static string CreateMD5(string input)
        {
            if (input == null) input = string.Empty;
            using (var md5 = MD5.Create())
            {
                var inputBytes = Encoding.UTF8.GetBytes(input);
                var hashBytes = md5.ComputeHash(inputBytes);
                var sb = new StringBuilder();
                foreach (var b in hashBytes) sb.Append(b.ToString("x2"));
                return sb.ToString();
            }
        }
    }
}
