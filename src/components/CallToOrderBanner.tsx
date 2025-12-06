const CallToOrderBanner = () => {
  return (
    <div className="bg-amber-500 text-white text-center py-2 px-3 flex  sm:flex-row items-center justify-center gap-2">
      <p className="text-xs sm:text-xs font-medium">
        Need help or want to order directly?
      </p>
      <a
        href="tel:+233202427880"
        className="bg-white text-xs text-amber-600 font-semibold px-2 py-1 rounded-full hover:bg-amber-100 transition"
      >
        Call Now
      </a>
    </div>
  );
};

export default CallToOrderBanner;
