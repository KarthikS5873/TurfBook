import React from 'react';

/**
 * Standard site footer
 */
const Footer = () => {
  return (
    <footer className="bg-slatebg-dark/95 border-t border-slate-800/80 py-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs">
          <div>
            <p className="font-semibold text-slate-300">
              © {new Date().getFullYear()} TurfBook TN. All rights reserved.
            </p>
            <p className="mt-1">
              The premier playground booking platform across all 38 districts of Tamil Nadu.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Contact Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
