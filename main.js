ZoomMtg.setZoomJSLib('https://source.zoom.us/2.10.1/lib', '/av')
ZoomMtg.preLoadWasm()
ZoomMtg.prepareWebSDK()
ZoomMtg.i18n.load('en-US')
ZoomMtg.i18n.reload('en-US')

let signatureEndpoint = 'https://new-test-zoom.herokuapp.com/'
let sdkKey = 'yep'
let meetingNumber = document.getElementById('meetingNumber')
let role = 0
let userName = ''
let userEmail = ''
let passWord = ''
let registrantToken = ''

function initZoomMeeting(signature) {

  const meetingSDKElement = document.getElementById('meetingSDKElement')
  const meetingSDKChatElement = document.getElementById('meetingSDKChatElement')
  const userName = document.getElementById('userName').value
  const meetingNumber = document.getElementById('meetingNumber').value
  const passWord = document.getElementById('passWord').value
  const client = ZoomMtgEmbedded.createClient()
  
  client.init({
    zoomAppRoot: meetingSDKElement,
    language: 'en-US',
    
    customize: {
      video: {
        isResizable: false,
        viewSizes: {
          default: {
            height: 1024,
            width: 576
          }
        },
        popper: {
          disableDraggable: true
        }
      },
      chat: {
        anchorElement: meetingSDKChatElement,
        placement: 'top',
        popper: {
          disableDraggable: true,
        }
      },
    }
  })

  client.join({
    sdkKey: sdkKey,
    signature: signature,
    meetingNumber: meetingNumber,
    password: passWord,
    userName: userName,
    userEmail: userEmail,
    tk: registrantToken
  })

  client.on('connection-change', (e) => {
    if (e.state == 'Connected') {
      return new Promise((resolve, reject) => {
        let ribbon = document.querySelector('button[title="Ribbon"]');
        let menuButton = document.querySelector('button[title="More"]');

        if (ribbon) {
          ribbon.click();
          console.log('-- switching to gallery view --');
        }
  
        if (menuButton) {
          menuButton.click();
          console.log('opening menu');
  

          let chatMenuItem = document.evaluate("//li[text()='Chat']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  
          if (chatMenuItem && chatMenuItem.singleNodeValue) {
            chatMenuItem.singleNodeValue.click();
            console.log('opening chat');
            return resolve(true);
            }
  
          return reject('unable to find Chat menu item');
        } else {
          return reject('unable to find More button');
        }
      }).then(() => {
        let xpath = "//span[text()='Gallery']";
        let galleryView = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  
        if (galleryView && galleryView.singleNodeValue) {
          galleryView.singleNodeValue.click();
          console.log('switching to Gallery view');
        }
      }).catch((error) => {
        console.log('--- error --> ', error);
      });
    }
  });
  }

function getSignature() {
  const meetingNumber = document.getElementById('meetingNumber').value
  fetch(signatureEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      meetingNumber: meetingNumber,
      role: role,
  
    })
  }).then((response) => {
    return response.json()
  }).then((data) => {
    console.log(data)
    initZoomMeeting(data.signature)
  }).catch((error) => {
    console.log(error)
  })
}


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    const joinMeetingButton = document.getElementById('joinButton')
    joinMeetingButton.addEventListener('click', getSignature)
  })
} else {
  const joinMeetingButton = document.getElementById('joinButton')
  joinMeetingButton.addEventListener('click', getSignature)
  function submitLoginForm(event){
    event.preventDefault();

    console.log(event.target['userName'].value);
    console.log(event.target['meetingNumber'].value);
}
}
