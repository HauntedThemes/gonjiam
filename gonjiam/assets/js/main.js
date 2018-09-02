/**
 * Main JS file for gonjiam
 */
jQuery(document).ready(function($) {

    var config = {
        'share-selected-text': true,
        'load-more': true,
        'infinite-scroll': false,
        'infinite-scroll-step': 999,
        'disqus-shortname': 'hauntedthemes-demo'
    };

    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
        readLaterPosts = [],
        url = [location.protocol, '//', location.host].join(''),
        noBookmarksMessage = $('.no-bookmarks').text(),
        monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "Sepember", "October", "November", "December"];

    setGalleryRation();

    $('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover'
    });

    $('.go-up').on('click', function(event) {
        event.preventDefault();
        $('body,html').animate({
            scrollTop: 0
        }, 500);
    });

    if ($(this).scrollTop() > 0) {
        $('body').addClass('scroll');
    } else {
        $('body').removeClass('scroll');
    };

    $(window).on('scroll', function(event) {

        if ($(this).scrollTop() > 0) {
            $('body').addClass('scroll');
        } else {
            $('body').removeClass('scroll');
        };

        if ($('.post-template').length) {
            progressBar();
        };

    });

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

    // Execute on load
    $(window).on('load', function(event) {

        var currentPage = 1;
        var pathname = window.location.pathname;
        var $result = $('.post');
        var step = 0;

        // remove hash params from pathname
        pathname = pathname.replace(/#(.*)$/g, '').replace('/\//g', '/');

        if ($('body').hasClass('paged')) {
            currentPage = parseInt(pathname.replace(/[^0-9]/gi, ''));
        }

        // Load more posts on click
        if (config['load-more'] && typeof maxPages !== 'undefined') {

            if (maxPages == 1) {
                $('#load-posts').addClass('hidden');
                return;
            };

            $('#load-posts').addClass('visible').removeClass('hidden');

            $('#load-posts').on('click', function(event) {
                event.preventDefault();

                if (currentPage == maxPages) {
                    $('#load-posts').addClass('hidden');
                    return;
                };

                var $this = $(this);

                // next page
                currentPage++;

                if ($('body').hasClass('paged')) {
                    pathname = '/';
                };

                // Load more
                var nextPage = pathname + 'page/' + currentPage + '/';

                if ($this.hasClass('step')) {
                    setTimeout(function() {
                        $this.removeClass('step');
                        step = 0;
                    }, 1000);
                };

                $.get(nextPage, function(content) {
                    step++;
                    var post = $(content).find('.post').addClass('opacity');
                    $('#content .loop').append(post);
                    $.each(post, function(index, val) {
                        var $this = $(this);
                    });
                });

                if (currentPage == maxPages) {
                    $('#load-posts').addClass('hidden');
                };

            });
        }else{
            $('#load-posts').removeClass('visible').addClass('hidden');
        };

        if (config['infinite-scroll'] && config['load-more']) {
            var checkTimer = 'on';
            if ($('#load-posts').length > 0) {
                $(window).on('scroll', function(event) {
                    var timer;
                    if (isScrolledIntoView('#load-posts') && checkTimer == 'on' && step < config['infinite-scroll-step']) {
                        $('#load-posts').click();
                        checkTimer = 'off';
                        timer = setTimeout(function() {
                            checkTimer = 'on';
                            if (step == config['infinite-scroll-step']) {
                                $('#load-posts').addClass('step');
                            };
                        }, 1000);
                    };
                });
            };
        };

        setGalleryRation();

    });

    // Initialize ghostHunter - A Ghost blog search engine
    var searchField = $("#search-field").ghostHunter({
        results: "#results",
        onKeyUp: true,
        zeroResultsInfo: true,
        displaySearchInfo: false,
        onComplete: function(results) {
            if (results.length) {
                $('#results').empty();

                $.each(results, function(index, val) {

                    var dateSplit = val.pubDate.split(' ')
                    var month = monthNames.indexOf(dateSplit[1])+1;
                    var date = moment(dateSplit[0]+'-'+month+'-'+dateSplit[2], "DD-MM-YYYY").format('DD MMM YYYY');

                    var tag;
                    if (val.tags.length) {
                        tag = '<span class="tags"><a href="/tag/' + val.tags[0].slug + '">' + val.tags[0].name + '</a></span>';
                    };
                    $('#results').append('\
                       <div class="item"> \
                        <article class="{{post_class}}" data-id={{comment_id}}> \
                          <div class="post-inner-content"> \
                              <p> \
                                <a href="' + val.link + '" class="post-title" title="' + val.title + '"><strong>' + val.title + '</strong></a> \
                              </p> \
                          </div> \
                          <div class="post-meta"> \
                              <time datetime="' + val.pubDate + '">' + date + '</time>' + tag + ' \
                              <div class="inner"> \
                                <a href="https://twitter.com/share?text=' + encodeURIComponent(val.title) + '&amp;url=' + url + val.link + '" class="twitter" onclick="window.open(this.href, \'share-twitter\', \'width=550,height=235\');return false;"><i class="fab fa-twitter"></i></a> \
                                <a href="#" class="read-later" data-id="' + val.id + '"><i class="far fa-bookmark"></i></a> \
                              </div> \
                          </div> \
                        </article> \
                       </div> \
                      ');
                });
                readLaterPosts = readLater($('#results'), readLaterPosts);
            } else if ($('#search-field').val().length && !results.length) {
                $('#results').append('<h3>'+ $('#results').attr('data-no-results') +'</h3><ul class="list-box loop row"><li class="col-md-12 item">'+ $('#results').attr('data-no-results-description') +'</li></ul>');
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

    function readLater(content, readLaterPosts) {

        if (typeof Cookies.get('gonjiam-read-later') !== "undefined") {
            $.each(readLaterPosts, function(index, val) {
                $('.read-later[data-id="' + val + '"]').addClass('active');
            });
            bookmarks(readLaterPosts);
        }

        $(content).find('.read-later').each(function(index, el) {
            $(this).on('click', function(event) {
                event.preventDefault();
                var id = $(this).attr('data-id');
                if ($(this).hasClass('active')) {
                    removeValue(readLaterPosts, id);
                } else {
                    readLaterPosts.push(id);
                };
                $('.read-later[data-id="' + id + '"]').each(function(index, el) {
                    $(this).toggleClass('active');
                });
                $('header .counter').addClass('shake');
                setTimeout(function() {
                    $('header .counter').removeClass('shake');
                }, 300);
                Cookies.set('gonjiam-read-later', readLaterPosts, {
                    expires: 365
                });
                bookmarks(readLaterPosts);
            });
        });

        return readLaterPosts;

    }

    function bookmarks(readLaterPosts) {

        $('.bookmark-container').empty();
        if (readLaterPosts.length) {

            var url = [location.protocol, '//', location.host].join('');

            $('header .counter').removeClass('hidden').text(readLaterPosts.length);
            $('.bookmark-container').removeClass('no-bookmarks');

            var filter = readLaterPosts.toString();
            filter = "id:[" + filter + "]";

            $.get(ghost.url.api('posts', {
                filter: filter,
                include: "tags"
            })).done(function(data) {

                $('.bookmark-container').empty();


                $.each(data.posts, function(index, val) {
                    var dateSplit = prettyDate(val.published_at).split(' ')
                    var month = monthNames.indexOf(dateSplit[1])+1;
                    var date = moment(dateSplit[0]+'-'+month+'-'+dateSplit[2], "DD-MM-YYYY").format('DD MMM YYYY');
                    var tag;
                    if (val.tags.length) {
                        tag = '<span class="tags"><a href="/tag/' + val.tags[0].slug + '">' + val.tags[0].name + '</a></span>';
                    };
                    $('.bookmark-container').append('\
                     <div class="item"> \
                      <article class="{{post_class}}" data-id={{comment_id}}> \
                        <div class="post-inner-content"> \
                            <p> \
                              <a href="' + val.link + '" class="post-title" title="' + val.title + '"><strong>' + val.title + '</strong></a> \
                            </p> \
                        </div> \
                        <div class="post-meta"> \
                            <time datetime="' + date + '">' + date + '</time>' + tag + ' \
                            <div class="inner"> \
                              <a href="https://twitter.com/share?text=' + encodeURIComponent(val.title) + '&amp;url=' + url + val.link + '" class="twitter" onclick="window.open(this.href, \'share-twitter\', \'width=550,height=235\');return false;" data-toggle="tooltip" data-placement="top" title="Share on Twitter"><i class="fab fa-twitter"></i></a> \
                              <a href="#" class="read-later active" data-id="' + val.id + '"><i class="far fa-bookmark"></i></a> \
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
                        } else {
                            readLaterPosts.push(id);
                        };
                        $('.read-later[data-id="' + id + '"]').each(function(index, el) {
                            $(this).toggleClass('active');
                        });
                        Cookies.set('gonjiam-read-later', readLaterPosts, {
                            expires: 365
                        });
                        bookmarks(readLaterPosts);
                    });
                });

                if (data.posts.length) {
                    $('header .counter').removeClass('hidden').text(data.posts.length);
                } else {
                    $('header .counter').addClass('hidden');
                    $('.bookmark-container').append('<p class="no-bookmarks">' + noBookmarksMessage + '</p>');
                };

            });
        } else {
            $('header .counter').addClass('hidden');
            $('.bookmark-container').append('<p class="no-bookmarks">' + noBookmarksMessage + '</p>')
        };
    }

    function prettyDate(date) {
        var d = new Date(date);
        var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "Sepember", "October", "November", "December"];
        return d.getDate() + ' ' + monthNames[d.getMonth()] + ' ' + d.getFullYear();
    };

    function removeValue(arr) {
        var what, a = arguments,
            L = a.length,
            ax;
        while (L > 1 && arr.length) {
            what = a[--L];
            while ((ax = arr.indexOf(what)) !== -1) {
                arr.splice(ax, 1);
            }
        }
        return arr;
    }

    $('#search-field').on('click', function(event) {
        $('#drawer').addClass('search-focus');
    });

    $('.close-search').on('click', function(event) {
        event.preventDefault();
        $('#drawer').removeClass('search-focus');
    });

    $('.modal').on('mouseup', function(e) {
        var container = $('.widget');
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            $('#drawer').removeClass('search-focus');
        }
    });

    // Initialize Highlight.js
    $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
    });

    // Check if element is into view when scrolling
    function isScrolledIntoView(elem) {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();

        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();

        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }

    // Initialize Disqus comments
    if ($('#content').attr('data-id') && config['disqus-shortname'] != '') {

        $('.comments .btn').on('click', function(event) {
            event.preventDefault();
            $(this).addClass('hidden');
            $('.comments').append('<div id="disqus_thread"></div>');

            var url = [location.protocol, '//', location.host, location.pathname].join('');
            var disqus_config = function() {
                this.page.url = url;
                this.page.identifier = $('#content').attr('data-id');
            };

            (function() {
                var d = document,
                    s = d.createElement('script');
                s.src = '//' + config['disqus-shortname'] + '.disqus.com/embed.js';
                s.setAttribute('data-timestamp', +new Date());
                (d.head || d.body).appendChild(s);
            })();
        });

    };

    // Initialize shareSelectedText
    if (config['share-selected-text']) {
        shareSelectedText('.post-template .editor-content', {
            sanitize: true,
            buttons: [
                'twitter',
            ],
            tooltipTimeout: 250
        });
    };

    // Progress bar for inner post
    function progressBar() {
        var postContentOffsetTop = $('.editor-content').offset().top;
        var postContentHeight = $('.editor-content').height();
        if ($(window).scrollTop() > postContentOffsetTop && $(window).scrollTop() < (postContentOffsetTop + postContentHeight)) {
            var heightPassed = $(window).scrollTop() - postContentOffsetTop;
            var percentage = heightPassed * 100 / postContentHeight;
            $('.progress').css({
                width: percentage + '%'
            });
            $('.progress').parent().addClass('visible');
            $('.progress').attr('data-original-title', parseInt(percentage) + '%');
            if ($('.progress').attr('aria-describedby')) {
                $('#' + $('.progress').attr('aria-describedby')).find('.tooltip-inner').text(parseInt(percentage) + '%');
            };
        } else if ($(window).scrollTop() < postContentOffsetTop) {
            $('.progress').css({
                width: '0%'
            });
            $('.progress').parent().removeClass('visible');
        } else {
            $('.progress').css({
                width: '100%'
            });
            $('.progress').attr('data-original-title', '100%');
            if ($('.progress').attr('aria-describedby')) {
                $('#' + $('.progress').attr('aria-describedby')).find('.tooltip-inner').text('100%');
            };
        };
    }

    if ($('.tweets').length) {
        var twitter = $('.tweets').attr('data-twitter').substr(1);
        $('.tweets').append('<a class="twitter-timeline" data-width="100%" data-height="800" data-tweet-limit="3" data-chrome="noborders noheader nofooter transparent" href="https://twitter.com/' + twitter + '?ref_src=twsrc%5Etfw"></a> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>');
    };

    // Set the right proportion for images inside the gallery
    function setGalleryRation(){
        $('.kg-gallery-image img').each(function(index, el) {
            var container = $(this).closest('.kg-gallery-image');
            var width = $(this)[0].naturalWidth;
            var height = $(this)[0].naturalHeight;
            var ratio = width / height;
            container.attr('style', 'flex: ' + ratio + ' 1 0%');
        });
    }

    // Validate subscribe form
    $(".gh-signin").each(function(index, el) {
        $(this).validate({
            rules: {
                email: {
                    required: true,
                    email: true
                },
            },
            submitHandler: function (form) {
                $(this).find(".gh-signin").submit();              
            }
        });
    });

    // Make all images from gallery ready to be zoomed
    $('.kg-gallery-image img').each(function(index, el) {
        $( "<a href='" + $(this).attr('src') + "' class='zoom'></a>" ).insertAfter( $(this) );
        $(this).appendTo($(this).next("a"));
    });

    $('.zoom').fluidbox();

    $('.zoom').on('openstart.fluidbox', function(event) {
        $('.kg-gallery-container').attr('style', 'z-index: 10');
    }).on('closeend.fluidbox', function(event) {
        $('.kg-gallery-container').attr('style', 'z-index: 2');
    });

    // Hide/Show menu
    function setMenu(w){
        if (w < 767) {
            $('header .nav').appendTo('#drawer .widget-menu');
        }else{
            $('#drawer .widget-menu .nav').appendTo('header .navigation');
            $('#drawer').modal('hide');
        };
    }

    setMenu(w);

    $(window).on('resize', function(event) {
        w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        setMenu(w);
    });

});