import { useAuthContext } from "@/app/contexts/auth/context";
import { Avatar } from "@/components/ui";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

/**
 * Header component with user greeting
 * Displays personalized greeting based on time of day and current date
 */
export default function Header() {
  const { user } = useAuthContext();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const currentDate = dayjs().format("dddd, DD [de] MMMM [de] YYYY");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/50 bg-primary-600 backdrop-blur-sm dark:border-gray-800/50">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <span className="text-xl font-semibold text-white">
              Recuerda<span className="text-primary-200">+</span>
            </span>
          </div>
        </div>

        {/* User info and greeting */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <h2 className="text-lg font-semibold text-white">
              {getGreeting()}, {user?.nombre?.split(" ")[0] || "Usuario"}
            </h2>
            <p className="text-sm capitalize text-primary-100">{currentDate}</p>
          </div>
          <Avatar className="ring-2 ring-primary-400">
            <span className="text-base font-semibold text-primary-600">
              {user?.nombre?.charAt(0) || "U"}
            </span>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
