$(function() {
  const wow = new WOW({
    boxClass: 'wow',
    animateClass: 'animate__animated',
    offset: 0,
    mobile: true,
    live: true,
    scrollContainer: null,
  });
  wow.init();

  window.addEventListener('scroll', function() {
    const sTop = document.body.scrollTop + document.documentElement.scrollTop;
    if (sTop > 30) {
      $('header').css('background', '#ffffff');
    } else {
      $('header').css('background', 'none');
    }
  });
});
