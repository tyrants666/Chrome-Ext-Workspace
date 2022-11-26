// CLASS WOKSPACE -----------------------------------------------------------------
class workspaceClass {
  constructor(){
    this.wsName = document.querySelector('#workspace-name').value;
  }
  //Save -------------------------------------
  workspace_save(){
    if(this.wsName){

      let lastWsItemId = Object.keys(wsItem).pop();
      if (lastWsItemId !== undefined) {
        wsId <= lastWsItemId ? wsId = +lastWsItemId+1 : '';
      }else{ wsId = 0; }

      workspaces[wsId] = {}
      workspaces[wsId].workspace_name = this.wsName;
      workspaces[wsId].workspace_color = 'red';
      workspaces[wsId].urls = {}
      workspaces[wsId].windowId = {}
      for (const i in tabs) {
        workspaces[wsId].urls[i] = {
          title:tabs[i].title,
          icon:tabs[i].favIconUrl,
          url:tabs[i].url,
          windowId:tabs[i].windowId++,
          groupId:tabs[i].groupId
        }
      }
      workspaces[wsId].windowId = workspaces[wsId].urls[0].windowId;

      localStorage_set()
      wsId++
    }
  }

  //Create Workspace Elem ---------------------------------------------------
  workspace_create_elem_(ws_id, ws_name) {
    const wsWrapper = document.querySelector('.workspaces');
    const wsTemplate = document.querySelector('#ws_template');
    const ws = wsTemplate.content.firstElementChild.cloneNode(true)
    ws.setAttribute('data-window-id', ws_id);
    ws.querySelector('.ws-name').textContent = ws_name;
    wsWrapper.prepend(ws)
    this.workspace_onclick();
  }

  //Workspace onclick ---------------------------------------------
  workspace_onclick(){
    let all_ws = document.querySelectorAll('.ws')
    for (const ws of all_ws) {
      ws.onclick = e => {

        //Create Tabs ---------
        let window_id = ws.getAttribute('data-window-id');
        let storedUrls = wsItem[window_id]['urls'];
        for (const i of Object.keys(storedUrls)) {
          chrome.tabs.create({ 
            url: storedUrls[i]['url'] ,
            active: false
          });
        }
      }
    }
  }
}
// END CLASS WOKSPACE -----------------------------------------------------------------
// END CLASS WOKSPACE -----------------------------------------------------------------



let wsId = 0;
let workspaces = new Object();

localStorage_get('onload')

const tabs = await chrome.tabs.query({ currentWindow:true });

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator
const collator = new Intl.Collator();
tabs.sort((a, b) => collator.compare(a.title, b.title));

const template = document.getElementById("li_template");
const elements = new Set();
for (const tab of tabs) {
  const element = template.content.firstElementChild.cloneNode(true);

  const title = tab.title.split("-")[0].trim();
  const pathname = new URL(tab.url).pathname.slice("/docs".length);

  element.querySelector(".title").textContent = title;
  element.querySelector(".pathname").textContent = pathname;
  element.querySelector("a").addEventListener("click", async () => {
    // need to focus window as well as the active tab
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  });

  elements.add(element);
}
document.querySelector("ul").append(...elements);







//Add Group Onclick --------------------------------------
const button = document.querySelector("button");
button.addEventListener("click", async () => {

  //Group Tabs
  const tabIds = tabs.map(({ id }) => id);
  const group = await chrome.tabs.group({ tabIds });
  await chrome.tabGroups.update(group, { title: "DOCS" });

  //Save Workkspace
  localStorage_get()
  window.wsObj = new workspaceClass()
  wsObj.workspace_save();

});

//Local Storage Functions----------------------------------------------
//Local Storage Functions----------------------------------------------
function localStorage_set() {
    localStorage.setItem('workspaces', JSON.stringify(workspaces));
    wsObj.workspace_create_elem_(wsId, wsObj.wsName);
}

function localStorage_get(trigger) {
  window.wsItem = {}
  if(localStorage['workspaces']){
    wsItem = JSON.parse(localStorage.getItem('workspaces'));
    
        if (trigger == 'onload') {
          window.wsObj = new workspaceClass()
          for (const key of Object.keys(wsItem)) {
            wsObj.workspace_create_elem_(key, wsItem[key]['workspace_name'])
          }
        }

  }
  workspaces = wsItem;
}







// workspaces = {
//   4424: {
//     workspace_name: "HP Tester",
//     workspace_color: "Red",
//     urls:{
//       0:{
//         icon:"",
//         name:"demo9",
//         url:"https://demo9.staging.com/"
//       },
//       1:{
//         icon:"",
//         name:"demo9",
//         url:"https://demo9.staging.com/"
//       }
//     }
//   },
//   4424: {
//     workspace_name: "HP Tester",
//     workspace_color: "Red",
//     urls:{
//       0:{
//         icon:"",
//         name:"demo9",
//         url:"https://demo9.staging.com/"
//       },
//       1:{
//         icon:"",
//         name:"demo9",
//         url:"https://demo9.staging.com/"
//       }
//     }
//   },
// }