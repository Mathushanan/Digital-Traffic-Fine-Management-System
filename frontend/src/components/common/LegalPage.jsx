import React from "react";

const LegalTermsPage = () => {
  return (
    <div className="container my-4">
      {/* Title */}
      <h2 className="text-muted text-center mb-2">Legal & Terms</h2>

      {/* Section for Terms of Service */}
      <section className="mb-4 text-start">
        <h3 className="text-muted fs-5">Terms of Service</h3>
        <p>
          By accessing or using our services, you agree to comply with and be
          bound by the following terms and conditions. If you do not agree with
          these terms, please do not use our services.
        </p>
        <ul>
          <li>
            <strong>Eligibility:</strong> You must be at least 18 years old to
            use this service.
          </li>
          <li>
            <strong>Usage Restrictions:</strong> You are prohibited from using
            the service for illegal or unauthorized purposes.
          </li>
          <li>
            <strong>Intellectual Property:</strong> All content, logos, and
            trademarks are the property of the respective owners and are
            protected by copyright laws.
          </li>
        </ul>
      </section>

      {/* Section for Privacy Policy */}
      <section className="mb-4 text-start">
        <h3 className="text-muted fs-5">Privacy Policy</h3>
        <p>
          Your privacy is important to us. This privacy policy outlines how we
          collect, use, and protect your personal information.
        </p>
        <ul>
          <li>
            <strong>Data Collection:</strong> We collect personal information
            only when you use our services or sign up.
          </li>
          <li>
            <strong>Use of Information:</strong> We use the collected data to
            improve the user experience and for service-related communications.
          </li>
          <li>
            <strong>Data Protection:</strong> We implement security measures to
            protect your personal data from unauthorized access.
          </li>
        </ul>
      </section>

      {/* Section for Disclaimer */}
      <section className="mb-4 text-start">
        <h3 className="text-muted fs-5">Disclaimer</h3>
        <p>
          The information provided by this service is for general informational
          purposes only. While we strive to keep the information accurate, we
          make no warranties regarding the completeness or accuracy of the
          content.
        </p>
        <ul>
          <li>
            <strong>Accuracy:</strong> We do not guarantee that the information
            on the website is free from errors.
          </li>
          <li>
            <strong>Liability:</strong> We will not be held liable for any loss
            or damage caused by the use of this service.
          </li>
          <li>
            <strong>External Links:</strong> Our website may contain links to
            external sites. We do not control these websites and are not
            responsible for their content.
          </li>
        </ul>
      </section>
    </div>
  );
};

export default LegalTermsPage;
