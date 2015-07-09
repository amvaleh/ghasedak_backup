;
(function ( $ ) {
    $.fn.dpTileSlider = function ( options ) {
        var $slider = this;

        // Define the slider options
        var $options = options || {};
        //TODO: public method
        //TODO: show the blank space on editor
        
        $options = {
            /**
             * Time delay before start animation on each slide.
             * This support you to setup your additional content before animation started
             */
            timeout: ((options && options.timeout) ? options.timeout : 50),
            
            // If set to true the slider will auto play
            auto: ((options && options.auto) ? options.auto : 'false'),
            
            // Toggle on/off the slider navigation and/or pager
            nav: ((options && options.nav) ? options.nav : 'true'),
            pager: ((options && options.pager) ? options.pager : 'true'),
            
            // Callback function fire when slider first start
            start: ((options && options.start) ? options.start : function () {}),
            
            // Callback function fire before/after each slide start to animate
            animBefore: ((options && options.animBefore) ? options.animBefore : function () {}),
            animAfter: ((options && options.animAfter) ? options.animAfter : function () {})
        };

        // Get & set slide selectors
        var dpSlides = $slider.children(),
            dpNext = $( '<a class="next">Next<span></span></a>' ),
            dpPrev = $( '<a class="prev">Previous<span></span></a>' ),
            pagers = makePager();

        // Array of animations type
        var anims = {
            scale: 'scale-anim',
            translate: 'translate-clockwise-anim',
            split: 'split-anim',
            split2: 'split-anim-sync',
            fall: 'fall-anim',
            rotate3D: 'rotate3D-anim',
            rotate3D2: 'rotate3D-anim-sync',
            rotate: 'rotate-anim'
        };

        // This indicate if the slider is animated
        var isAnim = false;

        // Initialize the slider
        function initSlider() {
            // Setup doms for slider
            initDoms( dpSlides );

            // Resize images when windows resize
            $( window ).on( 'resize', function () {
                var imgs = dpSlides.find('img[role=banner]');
                sizingImgs( imgs );
            });            
        }

        /**
         * Setup doms elements
         * @param {Array} slides collection of slides
         */
        function initDoms( slides ) {
            if ( !$slider.hasClass( 'dp-tile-slider' ) ) {
                $slider.addClass( 'dp-tile-slider' );
            }
            
            var imgs = dpSlides.find('img[role=banner]'),
            imgCount = imgs.length,
            imgLoadedCount = 0;
            
            // If slider is empty
            if ( imgCount === imgLoadedCount ) {
                $slider.hide();
                return false;   
            }
            
            $slider.append( pagers );
            pagers.addClass( 'is-loading' );
            
            var pagerBtns = pagers.find( 'a' );
            pagerBtns.eq( imgLoadedCount ).addClass('pulse');

            imgs.on('load', function() { 
                imgLoadedCount++;
                pagerBtns.eq( imgLoadedCount - 1 ).removeClass( 'pulse' ).addClass( 'active' );
                pagerBtns.eq( imgLoadedCount ).addClass( 'pulse' );
                
                // If all images are loaded
                if ( imgCount === imgLoadedCount ) {
                    sizingImgs( imgs );
                    imgs.show();
                    
                    pagers.removeClass( 'is-loading' );
                    pagerBtns.removeClass( 'active pulse' );
                    pagerBtns.eq( 0 ).addClass('active');
                    slides.eq( 0 ).addClass('active');
                    
                    /**
                     * Callback function fire when first starting slider,
                     * Associate with active slide
                     */
                    $options.start.call( slides.eq( 0 ) );
                    
                    // Manipulate the slides
                    slides.each(function () {
                        if ( !$( this ).hasClass( 'dp-slide' ) ) {
                            $( this ).addClass( 'dp-slide' );
                        }

                        var img = $( this ).children( 'img[role=banner]' ).eq( 0 );

                        var dpTile = $( '<div class="dp-tile"></div>' ),
                            dpImg = $( '<div class="dp-img"></div>' );

                        dpImg.append( img );
                        dpTile.append( dpImg );

                        for ( var i = 0; i < 4; i++ ) {
                            var tile = dpTile.clone();
                            tile.prependTo( $( this ) );
                        }
                    });
                    
                    // Set all slider controll actions
                    initControls();
                }
            });

            // Show/Hide navigation
            if ( $options.nav === 'true' && dpSlides.length > 1 ) {
                $slider.append( dpNext, dpPrev );
            }

            // Show/Hide pager
            if ( $options.pager !== 'true' || dpSlides.length <= 1 ) {
                pagers.remove();
            }
        }
        
        function initControls() {
            // When next button is clicked
            dpNext.on( 'click', function (e) {
                e.preventDefault();
                playNext( 'next' );
            });

            // When previous button is clicked
            dpPrev.on( 'click', function (e) {
                e.preventDefault();
                playNext( 'prev' );
            });
            
            //FUTURE: add swipe guestures

            // When every pager button is clicked
            pagers.each(function () {
                $( this ).find( 'a' ).each(function () {
                    $( this ).on( 'click', function ( e ) {
                        e.preventDefault();
                        var idx = $( this ).data( 'slide' );
                        playNext( 'shuff', dpSlides.filter( '[data-slide=' + idx + ']' ) );
                    });
                });
            });

            /**
             * Set auto slide on/off,
             * when no navigation & pager are visible the auto slide is on
             */
            if ( $options.auto === 'true' || 
                ( $options.nav === 'false' && $options.pager === 'false' ) ) {
                autoSlide();
            }   
        }

        /**
         * Risize the image according to the size of slider container
         * @param {Object} img image to be resized
         */
        function sizingImgs( imgs ) {
            imgs.each(function() {
                var img = this,
                    winWidth = $slider.width(),
                    winHeight = $slider.height(),
                    imgWidth = img.width,
                    imgHeight = img.height,
                    winPro = winWidth / winHeight,
                    imgPro = imgWidth / imgHeight;
                
                if ( imgPro < winPro ) {
                    $(img).addClass( 'is-landscape' );
                } else {
                    $(img).removeClass( 'is-landscape' );
                }
            });
        }

        /**
         * Play the animation && show the next slide
         * @param {String} dir   the direction left/right/shuff
         * @param {Object} slide slide to show next
         */
        function playNext( dir, slide ) {
            if ( isAnim ) { 
                return;
            }
            isAnim = true;
            
            var activeSlide = $slider.children( '.dp-slide.active' ),
                nextSlide,
                dataAnim = activeSlide.data( 'anim' ),
                random = Math.round( Math.random() * ( getObjSize( anims ) - 1 ) ),
                anim = anims.hasOwnProperty( dataAnim ) ? 
                    anims[ dataAnim ] : getObjValueAt( anims, random );

            // Callback function fire at the begining of each slide
            $options.animBefore.call( activeSlide );

            setTimeout(function () {
                if ( dir === 'next' ) {
                    nextSlide = getNextSlide( activeSlide );
                } else if ( dir === 'prev' ) {
                    nextSlide = getPreviousSlide( activeSlide );
                } else if ( dir === 'shuff' && slide ) {
                    nextSlide = slide;
                }

                if ( activeSlide.is( nextSlide ) ) {
                    isAnim = false;
                    return;
                }

                activeSlide.removeClass( 'active' )
                    .addClass( 'animated ' + anim )
                    .find( '.dp-tile .dp-img' )
                    .last()
                    .one('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend', 
                         function () {
                            isAnim = false;
                            activeSlide.removeClass( 'animated ' + anim );

                            /**
                             * Callback fire after each slide animated
                             */
                            $options.animAfter.call( nextSlide );
                        });

                nextSlide.addClass( 'active' )
                    .one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', 
                         function () {
                            var pagerBtns = pagers.find( 'a' );
                            pagerBtns.filter( '[data-slide=' + activeSlide.data( 'slide' ) + ']' )
                                .removeClass( 'active' );
                            pagerBtns.filter( '[data-slide=' + nextSlide.data( 'slide' ) + ']' )
                                .addClass( 'active' );
                        });
            }, $options.timeout );
        }

        /**
         * Get next slide
         * @param   {Object} activeSlide current slide
         * @returns {Object} next slide
         */
        function getNextSlide( activeSlide ) {
            var nextSlide = activeSlide.next( '.dp-slide' );
            if ( nextSlide.length <= 0 ) {
                nextSlide = activeSlide.siblings( '.dp-slide' ).first();
            } 
            
            return nextSlide;
        }

        /**
         * Get previous slide
         * @param   {Object} activeSlide current slide
         * @returns {Object} previous slide
         */
        function getPreviousSlide( activeSlide ) {
            var prevSlide = activeSlide.prev( '.dp-slide' );
            if ( prevSlide.length <= 0 ) {
                prevSlide = activeSlide.siblings( '.dp-slide' ).last();
            } 
            
            return prevSlide;
        }

        /**
         * Get number of properties of the object
         * @param   {Object}   obj Object to be got size
         * @returns {[[Type]]} [[Description]]
         */
        function getObjSize( obj ) {
            var size = 0,
                key;
            for ( key in obj ) {
                if ( obj.hasOwnProperty( key ) ) { 
                    size++;
                }
            }
            return size;
        }

        /**
         * Get property value of the object at the index
         * @param   {Object} obj Object
         * @param   {Number} idx Index of the property
         * @returns {String} Value of the property
         */
        function getObjValueAt( obj, idx ) {
            var i = 0,
                key, 
                val = false;
            for ( key in obj ) {
                if ( obj.hasOwnProperty( key ) ) {
                    if ( i === idx ) {
                        val = obj[ key ];
                        break;
                    } else {
                        i++;
                    }
                }
            }

            return val;
        }

        /**
         * Create pager
         * @returns {Object} Pager
         */
        function makePager() {
            var ul = $( '<ul/>' ).addClass( 'dp-pager' ),
                i = 0;
                
            for ( i = 0; i < dpSlides.length; i++ ) {
                var li = $( '<li></li>' ),
                    a = $( '<a href="#"></a>' );
                
                a.attr( 'data-slide', '' + i );
                li.append( a );
                ul.append( li );
                dpSlides.eq( i ).attr( 'data-slide', '' + i );
            }
            
            return ul;
        }

        /**
         * Auto slide
         */
        function autoSlide() {
            var timeDelay = 2000;
            setTimeout(function () {
                playNext( 'next' );
                setTimeout(function () {
                    autoSlide();
                }, timeDelay );
            }, timeDelay );
        }
        
        initSlider();
        return $slider;
    };
})( jQuery );