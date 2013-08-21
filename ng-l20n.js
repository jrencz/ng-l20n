/**
 * Author Michał Gołębiowski <michal.golebiowski@laboratorium.ee>
 * © 2012, 2013 Laboratorium EE
 *
 * License: MIT
 */

(function () {
    'use strict';

    angular.module('ngL20n', [])

        .factory('l20n', ['$rootScope', 'documentL10n', function ($rootScope, documentL10n) {
            var l20n = {
                init: function init() {
                    $rootScope.changeLocale = function changeLocale(newLocale) {
                        // The main function for changing a locale. Everything gets triggered by changes
                        // made in this function.
                        $rootScope.locale = newLocale;
                    };

                    // Dynamically change the site locale based on $rootScope.locale changes.
                    documentL10n.once(function () {
                        $rootScope.$apply(function () {
                            $rootScope.$watch('locale', function (newLocale) {
                                if (newLocale) { // it might be undefined
                                    localStorage.setItem('locale', newLocale);
                                    documentL10n.requestLocales(newLocale);
                                }
                            });

                            if (!localStorage.getItem('locale')) {
                                // First visit to the site, set the default locale in localStorage.
                                localStorage.setItem('locale', documentL10n.supportedLocales[0]);
                            }

                            $rootScope.locale = localStorage.getItem('locale');

                            // If the locale negotiated by L20n is different from
                            // the one we stored in localStorage, prefer the one in
                            // the localStorage
                            if (documentL10n.supportedLocales[0] !== $rootScope.locale) {
                                documentL10n.requestLocales($rootScope.locale);
                            }
                        });
                    });
                },

                updateData: function updateData() {
                    var event;

                    documentL10n.updateData.apply(documentL10n, arguments);

                    event = document.createEvent('HTMLEvents');
                    event.initEvent('l20n:dataupdated', true, true);
                    document.dispatchEvent(event);
                },
            };

            l20n.init();
            return l20n;
        }])

        .directive('l20n', ['documentL10n', function (documentL10n) {
            /**
             * Since the attribute data-l10n-id could hold not the localization id itself but a string
             * to be evaluated and l20n doesn't place nice with it, we need to pre-evaluate the attribute
             * and pass it to the data-l10n-id attribute later. The data-l10n-id attribute is, in turn,
             * processed by the l10nId directive.
             */
            return function (scope, element, attrs) {
                // Prepare for the l10nId directive.
                element.attr('data-l10n-id', attrs.l20n);

                documentL10n.once(function () {
                    document.addEventListener('l20n:dataupdated', updateTranslation);
                    updateTranslation();
                });

                function updateTranslation() {
                    documentL10n.localizeNode(element[0]);
                }

            };
        }])

        .value('documentL10n', document.l10n); // it's provided as value to be easily mocked in tests

})();
