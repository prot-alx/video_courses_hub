const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => (
  <div
    className="p-4 rounded-lg border"
    style={{
      background: "var(--color-primary-100)",
      borderColor: "var(--color-primary-400)",
    }}
  >
    <h3
      className="font-semibold mb-2"
      style={{ color: "var(--color-primary-400)" }}
    >
      {question}
    </h3>
    <p style={{ color: "var(--color-primary-400)" }}>{answer}</p>
  </div>
);

export default function FAQSection() {
  const faqItems = [
    {
      question: "Как записаться на курс?",
      answer:
        "Вы можете выбрать курс на странице Курсы и оставить заявку. Мы свяжемся с вами для подтверждения записи.",
    },
    {
      question: "Есть ли скидки для студентов?",
      answer:
        "Да, мы предоставляем скидки для студентов и школьников. Подробности можно уточнить по телефону или email.",
    },
    {
      question: "Можно ли перенести занятие?",
      answer:
        "Да, при необходимости занятие можно перенести. Просьба предупреждать о переносе за 24 часа.",
    },
    {
      question: "Какие способы оплаты принимаются?",
      answer:
        "Мы принимаем наличные, банковские карты, переводы и онлайн-платежи. Возможна рассрочка платежа.",
    },
  ];

  return (
    <section>
      <h2
        className="text-2xl font-semibold mb-6"
        style={{ color: "var(--color-text-primary)" }}
      >
        📋 Часто задаваемые вопросы
      </h2>
      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <FAQItem key={index} question={item.question} answer={item.answer} />
        ))}
      </div>
    </section>
  );
}
