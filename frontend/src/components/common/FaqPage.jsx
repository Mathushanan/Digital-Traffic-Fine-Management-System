import React from "react";

const FAQPage = () => {
  const faqData = [
    {
      question: "What is the Department of Motor Traffic?",
      answer:
        "The Department of Motor Traffic is a government agency responsible for regulating and managing motor vehicles and traffic laws in Sri Lanka.",
    },
    {
      question: "How can I renew my vehicle registration?",
      answer:
        "You can renew your vehicle registration online or visit a local DMT office to complete the renewal process. Ensure you have all necessary documents ready.",
    },
    {
      question: "What are the requirements for a driver's license?",
      answer:
        "To obtain a driver's license, you must pass a written exam and a practical driving test. You must also be at least 18 years old and meet health requirements.",
    },
    {
      question: "How can I report a traffic violation?",
      answer:
        "You can report traffic violations via our online portal or by visiting the nearest DMT office. Ensure you provide sufficient details, such as the vehicle number and incident description.",
    },
    {
      question: "What services are offered by the Department of Motor Traffic?",
      answer:
        "The DMT offers a variety of services, including vehicle registration, driving license issuance, traffic violation reporting, and more.",
    },
  ];

  return (
    <div className="container my-5">
      <h2 className="text-muted text-center mb-4">
        Frequently Asked Questions
      </h2>
      <div className="accordion" id="faqAccordion">
        {faqData.map((item, index) => (
          <div className="accordion-item" key={index}>
            <h2 className="accordion-header" id={`heading${index}`}>
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse${index}`}
                aria-expanded="true"
                aria-controls={`collapse${index}`}
              >
                {item.question}
              </button>
            </h2>
            <div
              id={`collapse${index}`}
              className="accordion-collapse collapse"
              aria-labelledby={`heading${index}`}
              data-bs-parent="#faqAccordion"
            >
              <div className="accordion-body">{item.answer}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQPage;
