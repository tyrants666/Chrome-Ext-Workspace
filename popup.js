// CLASS WOKSPACE -----------------------------------------------------------------
class workspaceClass {
  constructor(wsName){
    this.wsName = wsName;
  }
  //Save -------------------------------------
  workspace_save(){
    let lastWsItemId = Object.keys(wsItem).pop();
    if (lastWsItemId !== undefined) {
      wsId <= lastWsItemId ? wsId = +lastWsItemId+1 : '';
    }else{ 
      wsId = 0; 
    }

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
    this.workspace_create_elem(wsId, this.wsName);
    wsId++
  }

  //Create Workspace Elem ---------------------------------------------------
  workspace_create_elem(ws_id, ws_name) {
    const wsWrapper = document.querySelector('.workspaces');
    const wsTemplate = document.querySelector('#ws_template');
    const ws = wsTemplate.content.firstElementChild.cloneNode(true)
    ws.setAttribute('data-ws-id', ws_id);
    ws.querySelector('.ws-name').textContent = ws_name;
    wsWrapper.prepend(ws)
  }

  //Get Workspace Tabs ---------------------------------------------------
  workspace_tabs_get(ws_id) {
    let tabsArr = []
    let storedUrls = wsItem[ws_id]['urls'];
    for (const i of Object.keys(storedUrls)) {
      tabsArr.push(storedUrls[i]['url']);
    }
    console.log(tabsArr);
    return tabsArr;
  }

  //Group Workspace Tabs ---------------------------------------------------
  async workspace_tabs_group(ws_name) {
    const tabIds = tabs.map(({ id }) => id);
    const group = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(
      group,
      { title: ws_name }
    );
  }

}
// END CLASS WOKSPACE -----------------------------------------------------------------
// END CLASS WOKSPACE -----------------------------------------------------------------



let wsId = 0;
let workspaces = new Object();
localStorage_get('onload')
const tabs = await chrome.tabs.query({ currentWindow:true });


//Add Group Onclick / Enter --------------------------------------
const saveBtn = document.querySelector(".save");
const wsInput = document.querySelector('#workspace-name');

//Input on enter
wsInput.onkeypress = e => {
  if (e.key === "Enter"){ saveBtn.click(); }
}

//Save on click
saveBtn.addEventListener("click", async () => {
  const wsName = wsInput.value;
  localStorage_get()
  if (wsName) {
    window.wsObj = new workspaceClass(wsName)
    wsObj.workspace_save();
    wsObj.workspace_tabs_group(wsName);
  } else {
    console.error('Please Enter Workspace Name');
  }
});



// Workspace onclick ---------------------------------------------
let all_ws = document.querySelectorAll('.ws')
for (const ws of all_ws) {
  ws.querySelector('a').onclick = async e => {

    // Create Window -- with all urls
    let ws_id = ws.getAttribute('data-ws-id');
    let urlsArr = wsObj.workspace_tabs_get(ws_id)
    chrome.windows.create({
      url: urlsArr,
      type: "normal",
    });
    
    // Group Tabs
    // let urlsArr = wsObj.workspace_tabs_get(ws_id)
    // const wsName = 
    // wsObj.workspace_tabs_group(wsName);
    // const tabIds = tabs.map(({ id }) => id);
    // const group = await chrome.tabs.group({ tabIds });
    // await chrome.tabGroups.update(group, { title: "DOCS" });
  }
}

// Workspace remove -----------------------------------------------
let all_remove = document.querySelectorAll('svg.ws-remove');
for (const remove of all_remove) {
  remove.onclick = e => {
    let ws_id = remove.parentElement.getAttribute('data-ws-id');
    delete workspaces[ws_id]
    localStorage_set()
    remove.parentElement.remove();
  }
}

// Local Storage Functions----------------------------------------------

// Set
function localStorage_set() {
    localStorage.setItem('workspaces', JSON.stringify(workspaces));
}

// Get
function localStorage_get(trigger) {
  window.wsItem = {}
  if(localStorage['workspaces']){
    wsItem = JSON.parse(localStorage.getItem('workspaces'));
    
        if (trigger == 'onload') {
          window.wsObj = new workspaceClass()
          for (const key of Object.keys(wsItem)) {
            wsObj.workspace_create_elem(key, wsItem[key]['workspace_name'])
          }
        }

  }
  workspaces = wsItem;
}