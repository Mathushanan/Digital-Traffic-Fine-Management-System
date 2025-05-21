import React from "react";

const FAQPage = () => {
  const faqData = [
    {
      question: "What is the role of the Sri Lankan Traffic Police?",
      answer:
        "The Sri Lankan Traffic Police is responsible for enforcing traffic laws, managing road safety, and investigating road accidents.",
    },
    {
      question: "How can I contact the Traffic Police in Sri Lanka?",
      answer:
        "You can contact the Traffic Police via the 119 emergency hotline or visit the nearest police station.",
    },
    {
      question: "Can I report reckless driving to the Traffic Police?",
      answer:
        "Yes, reckless driving can be reported to the Traffic Police through the hotline or online complaint portals.",
    },
    {
      question: "What documents should I carry while driving in Sri Lanka?",
      answer:
        "You must carry your driving license, vehicle registration certificate (RC), insurance certificate, and national identity card or passport.",
    },
    {
      question: "What is the penalty for drunk driving in Sri Lanka?",
      answer:
        "Drunk driving can result in a fine, license suspension, imprisonment, or all three, depending on the severity of the offense.",
    },
    {
      question: "How are traffic fines issued in Sri Lanka?",
      answer:
        "Traffic fines are issued by police officers at the scene of the violation or later through the digital traffic fine system.",
    },
    {
      question: "Can I pay traffic fines online in Sri Lanka?",
      answer:
        "Yes, traffic fines can be paid online through the official government e-service portals.",
    },
    {
      question: "What happens if I don’t pay a traffic fine on time?",
      answer:
        "Failure to pay a fine on time may result in additional penalties or legal action.",
    },
    {
      question: "What is the speed limit in urban areas?",
      answer:
        "The speed limit in urban areas is generally 50 km/h unless otherwise specified.",
    },
    {
      question: "Is wearing a helmet mandatory for motorcycle riders?",
      answer:
        "Yes, both the rider and passenger on a motorcycle must wear helmets at all times.",
    },
    {
      question: "How can I check if I have any outstanding traffic fines?",
      answer:
        "You can check for outstanding traffic fines through the Police or DMT online portals by entering your vehicle number or NIC.",
    },
    {
      question: "Can foreigners drive in Sri Lanka?",
      answer:
        "Yes, foreigners can drive with an International Driving Permit or a Sri Lankan driving license.",
    },
    {
      question: "What should I do if I lose my traffic fine receipt?",
      answer:
        "You can visit the police station where the fine was issued or access the online portal to retrieve a copy of your receipt.",
    },
    {
      question: "Are there mobile Traffic Police units in Sri Lanka?",
      answer:
        "Yes, mobile units patrol highways and urban areas to monitor compliance with traffic rules.",
    },
    {
      question: "What is the fine for using a mobile phone while driving?",
      answer:
        "Using a mobile phone while driving can lead to a fine and potential license demerit points.",
    },
    {
      question: "What is a spot fine?",
      answer:
        "A spot fine is an immediate penalty issued by Traffic Police for minor traffic violations.",
    },
    {
      question: "Can I dispute a traffic fine?",
      answer:
        "Yes, if you believe the fine was issued in error, you can dispute it by appearing in traffic court.",
    },
    {
      question: "Is seatbelt use mandatory in Sri Lanka?",
      answer:
        "Yes, seatbelts are mandatory for drivers and front-seat passengers in cars and vans.",
    },
    {
      question: "What happens if I commit multiple traffic offenses?",
      answer:
        "Multiple offenses may lead to higher fines, court appearances, or license suspension.",
    },
    {
      question: "Are CCTV cameras used for traffic monitoring?",
      answer:
        "Yes, CCTV cameras are used in major cities and highways to monitor traffic and identify violations.",
    },
    {
      question: "Can Traffic Police impound my vehicle?",
      answer:
        "Yes, in cases of serious violations or lack of documentation, your vehicle can be impounded.",
    },
    {
      question: "What are demerit points in Sri Lanka’s traffic system?",
      answer:
        "Demerit points are added to a driver’s license for violations. Accumulating too many points can result in license suspension.",
    },
    {
      question: "How can I become a Traffic Police officer in Sri Lanka?",
      answer:
        "You must apply through the Sri Lanka Police Department and undergo training and assessments.",
    },
    {
      question: "What is the legal blood alcohol limit for drivers?",
      answer:
        "The legal blood alcohol limit is 0.08%. Exceeding this limit can result in serious penalties.",
    },
    {
      question: "What should I do if I witness a traffic accident?",
      answer:
        "You should call the police immediately, provide assistance if safe to do so, and wait for authorities to arrive.",
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
