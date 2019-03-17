import { CONFIG } from '../../../config';

export class ProfilePopup {
  api;
  userTwitterId;

  constructor(userTwitterId, api) {
    this.userTwitterId = userTwitterId;
    this.api = api;
  }

  async showOnClick(displayElement) {
    const { score: allCryptoScore } = await this.api.getTwitterUserScore(
      this.userTwitterId,
      'Crypto'
    );

    const clusters = await this.api.getTwitterUserClusters(this.userTwitterId);

    const displayPopup = () => {
      const POPUP_CLASS = 'HiveExtension-Twitter_popup-profile';
      const POPUP_HIDDEN_CLASS = `${POPUP_CLASS}-hidden`;

      if (displayElement.querySelector(`.${POPUP_CLASS}`)) {
        return;
      }

      const roundedAllCryptoScore = Math.round(allCryptoScore);
      const cryptoPercentage = Math.floor((roundedAllCryptoScore / CONFIG.MAX_SCORE) * 100);

      const popupNode = document.createElement('div');
      popupNode.classList.add(POPUP_CLASS);
      popupNode.classList.add(POPUP_HIDDEN_CLASS);

      let clustersHTML = ``;

      clusters.map(cluster => {
        if (cluster.abbr === 'Crypto') {
          return;
        }

        const roundedScore = Math.round(cluster.score);
        const percentage = Math.floor((roundedScore / CONFIG.MAX_SCORE) * 100);

        clustersHTML += `
              <div class="HiveExtension-Twitter_popup-profile_cluster-score">
                  <div class="HiveExtension-Twitter_popup-profile_cluster-score_left">
                      ${cluster.display}
                  </div>
                  <div class="HiveExtension-Twitter_popup-profile_cluster-score_right">
                      <span class="HiveExtension-Twitter_popup-profile_cluster-score_right_bold">${roundedScore}</span>
                      <span class="HiveExtension-Twitter_popup-profile_cluster-score_right_small">/ 1000</span>
                  </div>
                  <div class="HiveExtension-Twitter_popup-profile_cluster-score_progress-bar">
                      <div class="HiveExtension-Twitter_popup-profile_cluster-score_progress-bar_bg"></div>
                      <div class="HiveExtension-Twitter_popup-profile_cluster-score_progress-bar_progress" style="width:${percentage}%"></div>
                  </div>
              </div>
              `;
      });

      let FOLLOWERS_HTML = '';

      const cryptoCluster = clusters.find(item => item.abbr === 'Crypto');

      if (cryptoCluster) {
        cryptoCluster.followers.forEach(({ screenName }) => {
          FOLLOWERS_HTML += `
                        <div class="${POPUP_CLASS}_followers_follower">
                            <img class="${POPUP_CLASS}_followers_follower_image" src="https://twitter.com/${screenName}/profile_image?size=mini" />
                            <div class="${POPUP_CLASS}_followers_follower_name">${screenName}</div>
                        </div>
                    `;
        });
      }

      const CUSTOM_HTML = `
                <div class="${POPUP_CLASS}_content">
                    <h3 class="${POPUP_CLASS}_title">PeopleScore</h3>
                    <div class="radial-progress" data-progress="${cryptoPercentage}">
                        <div class="circle">
                            <div class="mask full">
                                <div class="fill"></div>
                            </div>
                            <div class="mask half">
                                <div class="fill"></div>
                                <div class="fill fix"></div>
                            </div>
                        </div>
                        <div class="circle_inset">
                            <div class="percentage">
                                <div class="numbers">
                                    <span class="numbers_main">${roundedAllCryptoScore}</span>
                                    <span class="numbers_helper">AVERAGE SCORE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    ${clustersHTML}
                </div>
                <br/>
                <h3 class="${POPUP_CLASS}_title">Top Followers</h3>
                <div class="${POPUP_CLASS}_followers">
                    ${FOLLOWERS_HTML}
                </div>
          `;
      popupNode.innerHTML = CUSTOM_HTML;

      displayElement.appendChild(popupNode);

      const { top } = popupNode.getBoundingClientRect();

      const positionChange = popupNode.offsetHeight + 6;

      let newTopChange = -(popupNode.offsetHeight + 6);

      if (top >= positionChange) {
        popupNode.style.top = `${newTopChange}px`;
      }

      popupNode.classList.remove(POPUP_HIDDEN_CLASS);

      setTimeout(() => {
        const closePopup = event => {
          if (event.target === popupNode || popupNode.contains(event.target)) {
            return;
          }

          displayElement.querySelector(`.${POPUP_CLASS}`).remove();

          document.removeEventListener('click', closePopup);
        };

        document.addEventListener('click', closePopup);
      }, 0);
    };

    displayElement.addEventListener('click', displayPopup, false);
  }
}