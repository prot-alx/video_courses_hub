// app/teachers/page.tsx - страница "Педагоги"
"use client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

// Компонент карточки педагога
const TeacherCard = ({
  name,
  position,
  experience,
  specialization,
  description,
  avatar = "👨‍🏫",
}: {
  name: string;
  position: string;
  experience: string;
  specialization: string[];
  description: string;
  avatar?: string;
}) => (
  <div
    className="p-6 rounded-lg border hover:shadow-lg transition-shadow"
    style={{
      background: "var(--color-primary-100)",
      borderColor: "var(--color-primary-400)",
    }}
  >
    <div className="text-center mb-4">
      <div className="text-6xl mb-2">{avatar}</div>
      <h3
        className="text-xl font-semibold mb-1"
        style={{ color: "var(--color-primary-400)" }}
      >
        {name}
      </h3>
      <p
        className="text-sm font-medium mb-2"
        style={{ color: "var(--color-primary-400)" }}
      >
        {position}
      </p>
      <p className="text-sm" style={{ color: "var(--color-primary-400)" }}>
        Опыт: {experience}
      </p>
    </div>

    <div className="mb-4">
      <h4
        className="text-sm font-semibold mb-2"
        style={{ color: "var(--color-primary-400)" }}
      >
        Специализация:
      </h4>
      <div className="flex flex-wrap gap-2">
        {specialization.map((spec, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs rounded"
            style={{
              background: "var(--color-primary-300)",
              color: "var(--color-text-primary)",
            }}
          >
            {spec}
          </span>
        ))}
      </div>
    </div>

    <p
      className="text-sm leading-relaxed"
      style={{ color: "var(--color-primary-400)" }}
    >
      {description}
    </p>
  </div>
);

export default function TeachersPage() {
  const teachers = [
    {
      name: "Анна Иванова",
      position: "Старший преподаватель",
      experience: "8 лет",
      specialization: ["Математика", "Физика", "Подготовка к ЕГЭ"],
      description:
        "Кандидат физико-математических наук. Специализируется на подготовке к ЕГЭ и олимпиадам. Её ученики неоднократно становились призёрами всероссийских олимпиад.",
      avatar: "👩‍🔬",
    },
    {
      name: "Михаил Петров",
      position: "Ведущий преподаватель",
      experience: "12 лет",
      specialization: ["Программирование", "IT-технологии", "Web-разработка"],
      description:
        "Senior-разработчик с многолетним опытом в IT. Ведёт курсы по современным языкам программирования и веб-технологиям. Помог более 200 ученикам начать карьеру в IT.",
      avatar: "👨‍💻",
    },
    {
      name: "Елена Сидорова",
      position: "Преподаватель языков",
      experience: "10 лет",
      specialization: ["Английский язык", "Немецкий язык", "IELTS/TOEFL"],
      description:
        "Магистр лингвистики, сертифицированный преподаватель английского языка. Специализируется на подготовке к международным экзаменам и деловом английском.",
      avatar: "👩‍🏫",
    },
    {
      name: "Дмитрий Козлов",
      position: "Преподаватель творчества",
      experience: "6 лет",
      specialization: ["Дизайн", "Фотография", "Творческие проекты"],
      description:
        "Профессиональный дизайнер и фотограф. Ведёт курсы по графическому дизайну, фотографии и развитию творческих навыков. Его работы публиковались в известных изданиях.",
      avatar: "👨‍🎨",
    },
    {
      name: "Ольга Морозова",
      position: "Методист",
      experience: "15 лет",
      specialization: ["Педагогика", "Методология", "Развитие детей"],
      description:
        "Кандидат педагогических наук, эксперт в области современных методик обучения. Разрабатывает образовательные программы и курсы повышения квалификации для педагогов.",
      avatar: "👩‍💼",
    },
    {
      name: "Александр Волков",
      position: "Преподаватель бизнеса",
      experience: "9 лет",
      specialization: ["Предпринимательство", "Маркетинг", "Финансы"],
      description:
        "Успешный предприниматель и бизнес-консультант. Ведёт курсы по основам бизнеса, маркетингу и финансовой грамотности. Помог запустить более 50 стартапов.",
      avatar: "👨‍💼",
    },
  ];

  return (
    <div className="flex flex-col flex-1">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-bold mb-6"
            style={{ color: "var(--color-text-primary)" }}
          >
            Наши педагоги
          </h1>
          <p
            className="text-lg max-w-3xl mx-auto"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Команда опытных и квалифицированных преподавателей, которые помогут
            вам достичь ваших образовательных целей. Каждый педагог - эксперт в
            своей области с многолетним опытом практической работы.
          </p>
        </div>

        {/* Статистика команды */}
        <section className="mb-12">
          <div className="grid md:grid-cols-4 gap-6">
            <div
              className="text-center p-6 rounded-lg border"
              style={{
                background: "var(--color-primary-300)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              <div className="text-4xl mb-2">6</div>
              <div
                className="text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                Преподавателей
              </div>
            </div>
            <div
              className="text-center p-6 rounded-lg border"
              style={{
                background: "var(--color-primary-300)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              <div className="text-4xl mb-2">10+</div>
              <div
                className="text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                Лет опыта в среднем
              </div>
            </div>
            <div
              className="text-center p-6 rounded-lg border"
              style={{
                background: "var(--color-primary-300)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              <div className="text-4xl mb-2">15+</div>
              <div
                className="text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                Специализаций
              </div>
            </div>
            <div
              className="text-center p-6 rounded-lg border"
              style={{
                background: "var(--color-primary-300)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              <div className="text-4xl mb-2">1000+</div>
              <div
                className="text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                Довольных учеников
              </div>
            </div>
          </div>
        </section>

        {/* Преимущества наших педагогов */}
        <section className="mb-12">
          <h2
            className="text-2xl font-semibold mb-6 text-center"
            style={{ color: "var(--color-text-primary)" }}
          >
            Почему наши педагоги лучшие
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div
              className="text-center p-6 rounded-lg border"
              style={{
                background: "var(--color-primary-100)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              <div className="text-4xl mb-4">🎓</div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--color-primary-400)" }}
              >
                Высшее образование
              </h3>
              <p style={{ color: "var(--color-primary-400)" }}>
                Все наши преподаватели имеют профильное высшее образование и
                регулярно повышают квалификацию
              </p>
            </div>
            <div
              className="text-center p-6 rounded-lg border"
              style={{
                background: "var(--color-primary-100)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              <div className="text-4xl mb-4">💼</div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--color-primary-400)" }}
              >
                Практический опыт
              </h3>
              <p style={{ color: "var(--color-primary-400)" }}>
                Наши педагоги не только преподают, но и имеют практический опыт
                работы в своих областях
              </p>
            </div>
            <div
              className="text-center p-6 rounded-lg border"
              style={{
                background: "var(--color-primary-100)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              <div className="text-4xl mb-4">❤️</div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--color-primary-400)" }}
              >
                Любовь к преподаванию
              </h3>
              <p style={{ color: "var(--color-primary-400)" }}>
                Каждый педагог искренне увлечён своим делом и готов поделиться
                знаниями с учениками
              </p>
            </div>
          </div>
        </section>

        {/* Карточки педагогов */}
        <section className="mb-12">
          <h2
            className="text-2xl font-semibold mb-8 text-center"
            style={{ color: "var(--color-text-primary)" }}
          >
            Познакомьтесь с нашей командой
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((teacher, index) => (
              <TeacherCard key={index} {...teacher} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div
            className="p-8 rounded-lg border"
            style={{
              background: "var(--color-primary-200)",
              borderColor: "var(--color-primary-400)",
            }}
          >
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              Хотите учиться у лучших?
            </h2>
            <p
              className="text-lg mb-6"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Выберите курс и начните обучение с нашими опытными педагогами
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses" className="btn-discord btn-discord-primary">
                📚 Выбрать курс
              </Link>
              <Link
                href="/contacts"
                className="btn-discord btn-discord-secondary"
              >
                📞 Задать вопрос
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
