using backend.Data;
using backend.Interfaces;
using Stripe;
using Stripe.Checkout;
using Stripe.V2;
using backend.Models;
using static System.Net.WebRequestMethods;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly SystemDbContext _systemDbContext;

        public PaymentService(SystemDbContext systemDbContext)
        {
            this._systemDbContext = systemDbContext;
        }
        public async Task<string> CreateCheckoutSessionAsync(int fineId, decimal? amount, string description)
        {
            string? StripeSecretKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY");
            // Initialize Stripe configuration
            StripeConfiguration.ApiKey = StripeSecretKey;

            // Create a Stripe session for payment
            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
                        {
                            new SessionLineItemOptions
                            {
                                PriceData = new SessionLineItemPriceDataOptions
                                {
                                    UnitAmount = (long)(amount.GetValueOrDefault() * 100), // Amount in cents
                                    Currency = "lkr", // Your currency (e.g., "usd", "lkr")
                                    ProductData = new SessionLineItemPriceDataProductDataOptions
                                    {
                                        Name = $"Department Of Motor Traffic Fine Payment",
                                        Description = $"Violation: {description}",
                                        Images = new List<string>
                                        {
                                            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Emblem_of_Sri_Lanka.svg/634px-Emblem_of_Sri_Lanka.svg.png"
                                        }
                                    },
                                },
                                Quantity = 1,
                            },
                        },
                Mode = "payment",
                SuccessUrl = $"{Environment.GetEnvironmentVariable("JWT_AUDIENCE")}/public-user/manage-fines/payment-success?session_id={{CHECKOUT_SESSION_ID}}&fine_id={fineId}&amount={amount}",
                CancelUrl = $"{Environment.GetEnvironmentVariable("JWT_AUDIENCE")}/public-user/manage-fines/payment-cancel"
            };

            // Create the session
            var service = new SessionService();
            Session session = await service.CreateAsync(options);
            return session.Id;
        }
        public async Task<bool> ConfirmPaymentAsync(string sessionId)
        {
            StripeConfiguration.ApiKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY");

            var service = new SessionService();
            Session session = await service.GetAsync(sessionId);

            if (session.PaymentStatus == "paid")
            {
                return true;
            }
            else
            {
                return false;
            }

        }
        public async Task<bool> AddPaymentAsync(Payment payment)
        {
            await _systemDbContext.Payments.AddAsync(payment);
            int changes = await _systemDbContext.SaveChangesAsync();

            // Return true if changes were saved, false otherwise
            return changes > 0;
        }
        public async Task<decimal> GetTotalRevenueAsync()
        {
            return await _systemDbContext.Payments
                .SumAsync(p => p.Amount);
        }

        public async Task<decimal> GetTotalRevenueByStationIdAsync(int stationId)
        {
            return await _systemDbContext.Payments
                .Where(p => p.Fine != null && p.Fine.StationId == stationId)
                .SumAsync(p => p.Amount);
        }

        public async Task<decimal> GetTotalRevenueByIssuerIdAsync(int issuerId)
        {
            return await _systemDbContext.Payments
                .Where(p => p.Fine != null && p.Fine.IssuerId == issuerId)
                .SumAsync(p => p.Amount);
        }

        public async Task<decimal> GetTotalRevenueByOffenderIdAsync(int offenderId)
        {
            return await _systemDbContext.Payments
                .Where(p => p.Fine != null && p.Fine.OffenderId == offenderId)
                .SumAsync(p => p.Amount);
        }



    }

}
