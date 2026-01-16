"use client";

import { useState } from "react";
import type { FooterNewsletter } from "@/sanity/lib/getSettings";

interface NewsletterSignupProps {
  newsletter?: FooterNewsletter;
}

export default function NewsletterSignup({
  newsletter,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (!newsletter?.heading) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    const subscribers = JSON.parse(
      localStorage.getItem("newsletter_subscribers") || "[]"
    );
    if (!subscribers.includes(email)) {
      subscribers.push(email);
      localStorage.setItem(
        "newsletter_subscribers",
        JSON.stringify(subscribers)
      );
    }

    setIsSubmitted(true);
    setEmail("");
  };

  if (isSubmitted) {
    return (
      <div className="w-full mb-8 md:mb-12 xl:mb-16">
        <p className="text-xs">
          {newsletter.successMessage || "Thanks for subscribing!"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full mb-8 md:mb-12 xl:mb-16">
      <p className="text-sm mb-4 md:mb-6">{newsletter.heading}</p>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={newsletter.placeholder}
          aria-label="Email address for newsletter"
          aria-describedby={error ? "newsletter-error" : undefined}
          aria-invalid={!!error}
          className="flex-1 px-2 py-2 border-b border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-2 focus:ring-black focus:ring-offset-1"
        />
        <button
          type="submit"
          className="w-full md:w-auto md:px-8 h-[50px] text-sm bg-black text-white cursor-pointer"
        >
          SUBSCRIBE
        </button>
      </form>
      {error && (
        <p id="newsletter-error" role="alert" className="text-red-500 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
