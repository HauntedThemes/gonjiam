/**
 * Main JS file for gonjiam
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
      readLaterPosts = [],
      url = [location.protocol, '//', location.host].join('');

  // Check 'read later' posts 
  if (typeof Cookies.get('gonjiam-read-later') !== "undefined") {
    readLaterPosts = JSON.parse(Cookies.get('gonjiam-read-later'));
  }

  readLaterPosts = readLater($('#content .loop'), readLaterPosts);

  $('.drawer-trigger').on('click', function(event) {
    event.preventDefault();
    $('.drawer').toggleClass('active');
  });

  $('body').on('click', '.modal-backdrop', function(event) {
    event.preventDefault();
    $('.modal.show .close').click();
  });

  // Initialize ghostHunter - A Ghost blog search engine
  var searchField = $("#search-field").ghostHunter({
      results             : "#results",
      onKeyUp             : true,
      zeroResultsInfo     : true,
      displaySearchInfo   : false,
      onComplete          : function( results ){
        if (results.length) {
            $('#results').empty();

            // var tags = [];
            // $.each(results, function(index, val) {
            //     if (val.tags.length) {
            //         if ($.inArray(val.tags[0].name, tags) === -1) {
            //             tags.push(val.tags[0].name);
            //         };
            //     }else{
            //         if ($.inArray('Other', tags) === -1) {
            //             tags.push('Other');
            //         };
            //     };
            // });
            // tags.sort();
            // tags = unique(tags);

            // $.each(tags, function(index, val) {
            //     $('#results').append('<h3>#'+ val +'</h3><ul data-tag="'+ val +'" class="list-box loop row"></ul>');
            // });

            $.each(results, function(index, val) {
              var tag;
              if (val.tags.length) {
                tag = '<span class="tags"><a href="/tag/'+ val.tags[0].slug +'">'+ val.tags[0].name +'</a></span>';
              };
              $('#results').append('\
               <div class="item"> \
                <article class="{{post_class}}" data-id={{comment_id}}> \
                  <div class="post-inner-content"> \
                      <p> \
                        <a href="'+ val.link +'" class="post-title" title="'+ val.title +'"><strong>'+ val.title +'</strong></a> \
                      </p> \
                  </div> \
                  <div class="post-meta"> \
                      <time datetime="'+ val.pubDate +'">'+ val.pubDate +'</time>'+ tag +' \
                      <div class="inner"> \
                        <a href="'+ val.link +'#disqus_thread" class="count-comments"></a> \
                        <a href="https://twitter.com/share?text='+ encodeURIComponent(val.title) +'&amp;url='+ url + val.link +'" class="twitter" onclick="window.open(this.href, \'share-twitter\', \'width=550,height=235\');return false;" data-toggle="tooltip" data-placement="top" title="Share on Twitter"><i class="fab fa-twitter"></i></a> \
                        <a href="#" class="read-later" data-id="'+ val.id +'"><i class="far fa-bookmark"></i></a> \
                      </div> \
                  </div> \
                </article> \
               </div> \
              ');
            });
            readLaterPosts = readLater($('#results'), readLaterPosts);
        }else if($('#search-field').val().length && !results.length){
            $('#results').append('<div class="no-results"><h3 class="title">No results were found.</h3><p>Your search - <b>'+ $('#search-field').val() +'</b> - did not match any articles.</p></div>');
        };
      }
  });

  function unique(list) {
      var result = [];
      $.each(list, function(i, e) {
          if ($.inArray(e, result) == -1) result.push(e);
      });
      return result;
  }

  function readLater(content, readLaterPosts){

      if (typeof Cookies.get('gonjiam-read-later') !== "undefined") {
          $.each(readLaterPosts, function(index, val) {
              $('.read-later[data-id="'+ val +'"]').addClass('active');
          });
          bookmarks(readLaterPosts);
      }
      
      $(content).find('.read-later').each(function(index, el) {
          $(this).on('click', function(event) {
              event.preventDefault();
              var id = $(this).attr('data-id');
              if ($(this).hasClass('active')) {
                  removeValue(readLaterPosts, id);
              }else{
                  readLaterPosts.push(id);
              };
              $('.read-later[data-id="'+ id +'"]').each(function(index, el) {
                  $(this).toggleClass('active');
              });
              $('header .counter').addClass('shake');
              setTimeout(function() {
                  $('header .counter').removeClass('shake');
              }, 300);
              Cookies.set('gonjiam-read-later', readLaterPosts, { expires: 365 });
              bookmarks(readLaterPosts);
          });
      });

      return readLaterPosts;

  }

  function bookmarks(readLaterPosts){

      $('.bookmark-container').empty();
      if (readLaterPosts.length) {

          var url = [location.protocol, '//', location.host].join('');

          $('header .counter').removeClass('hidden').text(readLaterPosts.length);
          var filter = readLaterPosts.toString();
          filter = "id:["+filter+"]";

          $.get(ghost.url.api('posts', {filter:filter, include:"tags"})).done(function (data){

              $('.bookmark-container').empty();

              $.each(data.posts, function(index, val) {
                console.log(val);
                var tag;
                if (val.tags.length) {
                  tag = '<span class="tags"><a href="/tag/'+ val.tags[0].slug +'">'+ val.tags[0].name +'</a></span>';
                };
                $('.bookmark-container').append('\
                 <div class="item"> \
                  <article class="{{post_class}}" data-id={{comment_id}}> \
                    <div class="post-inner-content"> \
                        <p> \
                          <a href="'+ val.link +'" class="post-title" title="'+ val.title +'"><strong>'+ val.title +'</strong></a> \
                        </p> \
                    </div> \
                    <div class="post-meta"> \
                        <time datetime="'+ val.pubDate +'">'+ val.pubDate +'</time>'+ tag +' \
                        <div class="inner"> \
                          <a href="'+ val.link +'#disqus_thread" class="count-comments"></a> \
                          <a href="https://twitter.com/share?text='+ encodeURIComponent(val.title) +'&amp;url='+ url + val.link +'" class="twitter" onclick="window.open(this.href, \'share-twitter\', \'width=550,height=235\');return false;" data-toggle="tooltip" data-placement="top" title="Share on Twitter"><i class="fab fa-twitter"></i></a> \
                          <a href="#" class="read-later" data-id="'+ val.id +'"><i class="far fa-bookmark"></i></a> \
                        </div> \
                    </div> \
                  </article> \
                 </div> \
                ');
              });

              $('.bookmark-container').find('.read-later').each(function(index, el) {
                  $(this).on('click', function(event) {
                      event.preventDefault();
                      var id = $(this).attr('data-id');
                      if ($(this).hasClass('active')) {
                          removeValue(readLaterPosts, id);
                          $('.tooltip').remove();
                      }else{
                          readLaterPosts.push(id);
                      };
                      $('.read-later[data-id="'+ id +'"]').each(function(index, el) {
                          $(this).toggleClass('active');
                      });
                      Cookies.set('gonjiam-read-later', readLaterPosts, { expires: 365 });
                      bookmarks(readLaterPosts);
                  });
              });

          });
      }else{
          $('header .counter').addClass('hidden');
          $('.bookmark-container').append('<p class="no-bookmarks">You haven\'t yet saved any bookmarks. To bookmark a post, just click <i class="far fa-bookmark"></i>.</p>')
      };

  }

  function prettyDate(date) {
      var d = new Date(date);
      var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          return d.getDate() + ' ' + monthNames[d.getMonth()] + ' ' + d.getFullYear();
  };

  function removeValue(arr) {
      var what, a = arguments, L = a.length, ax;
      while (L > 1 && arr.length) {
          what = a[--L];
          while ((ax= arr.indexOf(what)) !== -1) {
              arr.splice(ax, 1);
          }
      }
      return arr;
  }

  $('#search-field').on('click', function(event) {
    $('#drawer').addClass('search-focus');
  });

  $('.modal').on('mouseup', function(e) {
    var container = $('.widget');
    if (!container.is(e.target) && container.has(e.target).length === 0) {
      $('#drawer').removeClass('search-focus');
    }
  });

});