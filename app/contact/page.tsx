import React from 'react';
import ContactForm from '../../components/ContactForm';

export default function ContactPage() {
  return (
    <section className="min-h-screen bg-black text-white px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Get In Touch</h2>
        <p className="text-lg text-gray-300 text-center mb-10">
          Ready to capture your special moments? Let's discuss your photography needs and create something beautiful together.
        </p>
        <ContactForm />
      </div>
    </section>
  );
} 