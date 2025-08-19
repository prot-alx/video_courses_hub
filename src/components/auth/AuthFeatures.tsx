interface Feature {
  icon: string;
  text: string;
}

interface AuthFeaturesProps {
  features?: Feature[];
}

export default function AuthFeatures({ features }: Readonly<AuthFeaturesProps>) {
  const defaultFeatures: Feature[] = [
    {
      icon: "✅",
      text: "Безопасный вход через Google",
    },
    {
      icon: "🎯",
      text: "Отслеживание прогресса обучения",
    },
    {
      icon: "💝",
      text: "Доступ к бесплатным курсам",
    },
  ];

  const featuresToShow = features || defaultFeatures;

  return (
    <div className="space-y-3 mb-6">
      {featuresToShow.map((feature, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-lg">{feature.icon}</span>
          <span
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {feature.text}
          </span>
        </div>
      ))}
    </div>
  );
}
