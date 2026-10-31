/* Decap extensions preserve the existing local filesystem backend and JSON schema. */
(function () {
  const welcome = document.getElementById('studio-welcome');
  const help = document.getElementById('studio-help');
  const helpToggle = document.getElementById('studio-help-toggle');
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const english = value => typeof value === 'string' && value.trim() && !/\p{Script=Han}/u.test(value);
  const complete = w => w && ['title_en','category_en','description_en'].every(k=>english(w[k])) && english(w.detail_content?.full_desc_en) && (!w.client || english(w.client_en)) && (w.detail_content?.images||[]).every(img=>!img.alt || english(img.alt_en));
  const enter = name => {
    if (!local) { location.href = `http://localhost:5173/admin/#/collections/content/entries/${name}`; return; }
    if (!window.CMS) { document.getElementById('studio-status').textContent = '编辑器未加载，请检查网络后刷新'; return; }
    welcome.hidden = true; helpToggle.hidden = false;
    location.hash = `/collections/content/entries/${name}`;
  };
  document.querySelectorAll('[data-entry]').forEach(button=>button.addEventListener('click',()=>enter(button.dataset.entry)));
  helpToggle.onclick=()=>{help.hidden=!help.hidden;};
  document.getElementById('studio-help-close').onclick=()=>{help.hidden=true;};
  document.getElementById('studio-home').onclick=()=>{welcome.hidden=false;help.hidden=true;helpToggle.hidden=true;};
  if (local && location.hash.includes('/collections/')) { welcome.hidden=true;helpToggle.hidden=false; }
  fetch('../content/works.json?v='+Date.now()).then(r=>r.json()).then(data=>{
    document.getElementById('project-count').textContent=data.works.length;
    document.getElementById('translation-count').textContent=`${data.works.filter(complete).length}/${data.works.length}`;
    document.getElementById('slide-count').textContent=data.hero_images.length;
    data.works.slice(0,3).forEach(work=>{const img=document.createElement('img');img.src=work.image;img.alt=work.title;document.getElementById('recent-projects').append(img);});
  }).catch(()=>{document.getElementById('studio-status').textContent='内容读取失败，请刷新重试';});
  if(local) fetch('http://127.0.0.1:8081/api/v1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'info'})}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{const el=document.getElementById('studio-status');el.textContent=`本地服务已连接 · ${data.repo}`;el.classList.add('ready');}).catch(()=>{document.getElementById('studio-status').textContent='请双击“启动网站后台.command”连接本地服务';});
  else document.getElementById('studio-status').textContent='本地编辑 · 点击下方入口打开本机工作台';
  if(!window.CMS) return;
  const { CMS, h, createClass } = window;
  const Preview = createClass({
    getInitialState() {return {language:'cn',dark:false,mobile:false,index:0};},
    render() {
      const data=this.props.entry.get('data').toJS();
      const en=this.state.language==='en';
      const works=data.works||[];
      const w=works[Math.min(this.state.index,works.length-1)];
      const get=(object,key)=>en ? object?.[key+'_en']||object?.[key]||'' : object?.[key]||'';
      const asset=value=>{if(!value)return '';try{return this.props.getAsset(value).toString();}catch{return value;}};
      const Markdown=CMS.getWidget('markdown')?.preview;
      const control=(text,onClick,pressed)=>h('button',{type:'button',onClick,'aria-pressed':pressed},text);
      const toolbar=h('div',{className:'preview-toolbar'},h('strong',{},'实时预览'),
        control(en?'English':'中文',()=>this.setState({language:en?'cn':'en'}),en),
        control(this.state.dark?'深色':'浅色',()=>this.setState({dark:!this.state.dark}),this.state.dark),
        control(this.state.mobile?'手机':'桌面',()=>this.setState({mobile:!this.state.mobile}),this.state.mobile));
      const selector=works.length ? h('div',{className:'preview-selector'},
        h('select',{value:this.state.index,onChange:e=>this.setState({index:Number(e.target.value)})},works.map((item,index)=>h('option',{key:item.id||index,value:index},`${index+1}. ${get(item,'title')}`))),
        h('span',{className:complete(w)?'preview-ok':'preview-warning'},complete(w)?'✓ 双语文案完整':'待补全英文文案')) : null;
      const project=w ? h('article',{},
        h('div',{className:'preview-project'},
          h('div',{},h('img',{className:'preview-cover',src:asset(w.image),alt:get(w,'title')}),h('p',{className:'preview-hint'},'封面以 3:4 显示；详情图片保留原比例。')),
          h('div',{},h('p',{className:'preview-category'},get(w,'category')),h('h1',{},get(w,'title')),h('p',{className:'preview-desc'},get(w,'description')),
            h('div',{className:'preview-markdown'},Markdown?h(Markdown,{...this.props,value:get(w.detail_content,'full_desc')}):get(w.detail_content,'full_desc')),
            h('p',{className:'preview-meta'},`${get(w,'client')} · ${w.year||''}`))),
        h('div',{className:'preview-gallery'},(w.detail_content?.images||[]).map((img,index)=>h('figure',{key:index},h('img',{src:asset(img.url),alt:get(img,'alt')}),h('figcaption',{},get(img,'alt'))))))
        : h('article',{},h('p',{className:'preview-category'},data.hero?.[en?'tag_en':'tag_cn']),h('h1',{},data.hero?.[en?'title1_en':'title1_cn']),h('p',{className:'preview-desc'},data.hero?.[en?'desc_en':'desc_cn']),h('hr'),h('h2',{},data.footer?.[en?'cta_en':'cta_cn']),h('p',{},data.footer?.email),h('p',{},data.footer?.[en?'tagline_en':'tagline_cn']));
      const canvas=h('div',{className:'preview-canvas'+(this.state.mobile?' is-mobile':'')},h('header',{className:'preview-brand'},h('img',{src:asset(data.logo||'/new-logo.png'),alt:'KOOG'}),'KOOG DESIGN'),project);
      return h('div',{className:'preview-studio'+(this.state.dark?' is-dark':'')},toolbar,selector,canvas);
    }
  });
  CMS.registerPreviewStyle('preview.css?v=20261031-2');
  CMS.registerPreviewTemplate('works',Preview);
  CMS.registerPreviewTemplate('site_general',Preview);
  CMS.registerEventListener({name:'preSave',handler:({entry})=>{
    const data=entry.get('data');const works=data.get('works');if(!works)return data;
    const errors=[];const ids=new Set();
    works.toJS().forEach((w,index)=>{if(!w.id||ids.has(String(w.id)))errors.push(`第 ${index+1} 个项目需要唯一 ID`);ids.add(String(w.id));if(!complete(w))errors.push(`${w.title||'新项目'}：请补齐英文标题、分类、简介与正文`);});
    for (const slide of data.get('hero_images')?.toJS() || []) {
      if (!english(slide.alt_en)) errors.push('请填写每张轮播图的英文描述');
      if (slide.project_id && !ids.has(String(slide.project_id))) errors.push(`轮播关联的项目 ${slide.project_id} 不存在`);
    }
    if(errors.length)throw new Error(errors.join('；'));
    return data;
  }});
  CMS.registerEventListener({name:'postSave',handler:()=>{const el=document.getElementById('studio-toast');el.textContent='已保存到本地。预览确认后，双击“同步网站更新.command”上线。';el.hidden=false;setTimeout(()=>{el.hidden=true;},6000);}});
  CMS.init();
})();
