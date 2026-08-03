/**
 * Shared app bootstrap — call after PageRender.mount()
 */
window.SolarMNBoot = function SolarMNBoot() {
  const headerApi = Header.init();
  const slideshowApi = Slideshow.init({
    selector: '#hero-slideshow',
    interval: 5500,
  });
  const navApi = SectionNav.init();
  const aboutApi = typeof About !== 'undefined' ? About.init() : null;
  const productsApi = typeof Products !== 'undefined' ? Products.init() : null;
  const projectsApi = typeof Projects !== 'undefined' ? Projects.init() : null;
  const servicesApi = typeof Services !== 'undefined' ? Services.init() : null;
  const testimonialsApi = typeof Testimonials !== 'undefined' ? Testimonials.init() : null;
  const newsApi = typeof News !== 'undefined' ? News.init() : null;
  const contactApi = typeof Contact !== 'undefined' ? Contact.init() : null;
  const footerApi = typeof SiteFooter !== 'undefined' ? SiteFooter.init() : null;
  const cartApi = (window.SolarMNTheme && (window.SolarMNTheme.id === 'solar' || window.SolarMNTheme.id === 'led') && window.SolarCart)
    ? window.SolarCart.init()
    : null;

  window.SolarMN = {
    header: headerApi,
    slideshow: slideshowApi,
    nav: navApi,
    about: aboutApi,
    products: productsApi,
    projects: projectsApi,
    services: servicesApi,
    testimonials: testimonialsApi,
    news: newsApi,
    contact: contactApi,
    footer: footerApi,
    cart: cartApi,
    theme: window.SolarMNTheme || null,
  };
};
