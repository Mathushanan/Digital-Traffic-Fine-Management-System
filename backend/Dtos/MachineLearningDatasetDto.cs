using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Dtos
{
    public class MachineLearningDatasetDto
    {
        // Fine Info
        public int FineId { get; set; }
        public DateTime? ViolationDate { get; set; }
        public DateTime? DueDate { get; set; }
        public string? FineStatus { get; set; }
        public string? District { get; set; }
        public string? Longitude { get; set; }
        public string? Latitude { get; set; }

        // Offender Info
        public int? OffenderId { get; set; }
        public string? OffenderFirstName { get; set; }
        public string? OffenderLastName { get; set; }
        public string? OffenderGender { get; set; }
        public DateTime? OffenderDOB { get; set; }
        public string? OffenderAddress { get; set; }
        public string? OffenderEmail { get; set; }
        public string? OffenderContactNumber { get; set; }
        public string? OffenderNicNumber { get; set; }
        public string? OffenderLicenseNumber { get; set; }
        public DateTime? OffenderLicenseIssueDate { get; set; }
        public DateTime? OffenderLicenseExpiryDate { get; set; }
        public int? OffenderAvailablePoints { get; set; }
        public string? OffenderEligibleVehicleCategories { get; set; }

        // Issuer Info
        public int? IssuerId { get; set; }
        public string? IssuerFirstName { get; set; }
        public string? IssuerLastName { get; set; }
        public string? IssuerGender { get; set; }
        public string? IssuerNicNumber { get; set; }
        public string? IssuerLicenseNumber { get; set; }
        public int? IssuerBadgeNumber { get; set; }

        // Violation Info
        public int ViolationId { get; set; }
        public string? SectionOfAct { get; set; }
        public string? ViolationType { get; set; }
        public string? ViolationProvision { get; set; }
        public decimal ViolationFineAmount { get; set; }
        public int ViolationPoints { get; set; }
        public int ViolationDueDays { get; set; }

        // Vehicle Info
        public int VehicleId { get; set; }
        public string? VehicleNumber { get; set; }
        public string? VehicleCategory { get; set; }
        public string? VehicleMake { get; set; }
        public string? VehicleModel { get; set; }
        public int VehicleYear { get; set; }
        public string? VehicleColor { get; set; }
        public string? VehicleRegistrationNo { get; set; }
        public DateTime? VehicleRegistrationDate { get; set; }
        public bool IsRoadTaxPaid { get; set; }
        public bool IsInsuranced { get; set; }

        // Court Info
        public int CourtId { get; set; }
        public string? CourtName { get; set; }
        public string? CourtType { get; set; }
        public string? CourtLocation { get; set; }
        public string? CourtJurisdiction { get; set; }
        public string? CourtContactNumber { get; set; }
        public DateTime? CourtEstablishedDate { get; set; }

        // Station Info
        public int StationId { get; set; }
        public string? StationCode { get; set; }
        public string? StationName { get; set; }
        public string? StationAddress { get; set; }
        public string? StationDistrict { get; set; }
        public string? StationContactNumber { get; set; }
        public string? StationEmail { get; set; }

        // Payment Info
        public int? PaymentId { get; set; }
        public decimal? PaymentAmount { get; set; }
        public DateTime? PaymentDate { get; set; }
        public string? PaymentMethod { get; set; }
        public string? TransactionId { get; set; }

        // Dispute Info
        public int? DisputeId { get; set; }
        public string? DisputeReason { get; set; }
        public string? DisputeStatus { get; set; }
        public DateTime? DisputeSubmissionDate { get; set; }

        // Audit Info (optional)
        public int? AuditId { get; set; }
        public string? ApiEndPoint { get; set; }
        public string? RequestType { get; set; }
        public DateTime? AuditTimeStamp { get; set; }
        public string? IpAddress { get; set; }
        public string? RequestHeader { get; set; }
        public string? RequestBody { get; set; }
        public string? QueryParams { get; set; }
        public string? UserAgent { get; set; }

        // Real-Time Tracking (optional)
        public string? OfficerTrackingLatitude { get; set; }
        public string? OfficerTrackingLongitude { get; set; }
        public DateTime? OfficerTrackingTimestamp { get; set; }

        // Notification (optional)
        public string? NotificationMessage { get; set; }
        public string? NotificationReceiverType { get; set; }
        public string? NotificationSentBy { get; set; }
        public DateTime? NotificationSentAt { get; set; }
    }
}
