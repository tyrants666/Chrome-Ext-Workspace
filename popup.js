

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

//Add Group Onclick
const button = document.querySelector("button");
button.addEventListener("click", async () => {

  //Group Tabs
  const tabIds = tabs.map(({ id }) => id);
  const group = await chrome.tabs.group({ tabIds });
  await chrome.tabGroups.update(group, { title: "DOCS" });

  //Save Workkspace
  let wsObj = new workspaceClass()
  wsObj.save_workspace();

});

// CLASS WOKSPACE -------------------------
class workspaceClass {
  constructor(){
    this.wsName = document.querySelector('#workspace-name').value;
  }

  save_workspace(){
    if(this.wsName){
      let workspaces = new Object();
      workspaces.workspace_name = this.wsName;
      workspaces.workspace_color = 'red';
      workspaces.urls = {}
      for (const i in tabs) {
        workspaces.urls[i] = {
          title:tabs[i].title,
          icon:tabs[i].favIconUrl,
          url:tabs[i].url
        }
      }
      this.create_workspace_elem();
      console.log(workspaces);
    }
  }

  create_workspace_elem() {
    const wsWrapper = document.querySelector('.workspaces');
    const wsTemplate = document.querySelector('#ws_template');
    // const elements = new Set();
    const ws = wsTemplate.content.firstElementChild.cloneNode(true)
    ws.querySelector('.ws-name').textContent = this.wsName;
    // elements.add(element);
    wsWrapper.append(ws)
  }

}

// workspaces = {
//   workspace_name: "HP Tester",
//   workspace_color: "Red",
//   urls:{
//     0:{
//       icon:"",
//       name:"demo9",
//       url:"https://demo9.staging.com/"
//     },
//     1:{
//       icon:"",
//       name:"demo9",
//       url:"https://demo9.staging.com/"
//     }
//   }
// }