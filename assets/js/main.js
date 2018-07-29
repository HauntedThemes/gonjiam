/**
 * Main JS file for poveglia
 */

jQuery(document).ready(function($) {

    var config = {
        'share-selected-text': true,
        'load-more': true,
        'infinite-scroll': false,
        'infinite-scroll-step': 1,
        'disqus-shortname': 'hauntedthemes-demo'
    };

    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
        readLaterPosts = [];

   $('.drawer-trigger').on('click', function(event) {
       event.preventDefault();
       $('.drawer').toggleClass('active');
   });

    $('body').on('click', '.modal-backdrop', function(event) {
        event.preventDefault();
        $('.modal.show .close').click();
    });

});