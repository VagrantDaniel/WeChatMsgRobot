import React, { Component } from 'react';
import { Layout,Row, Col,List,Pagination,Icon,Modal,Form,Input,Checkbox,Popconfirm, message,Button,Affix,Select, Tabs } from 'antd';
import 'antd/dist/antd.css'
import axios from 'axios' ;
const headURL="http://192.168.211.11:7780/api/v1"
const CheckboxGroup = Checkbox.Group;
const { TabPane } = Tabs;
const FormItem = Form.Item
const {
    Header, Content,
} = Layout;
const IconFont = Icon.createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1149803_6tf53u9xh2f.js',
});
const formItemOneLayout={
    labelCol:{
        sm:{span:7},
    },
    wrapperCol:{
        sm:{span:12},
    },
};
var options=[];
class Robot extends Component {
    constructor(props){ //构造函数
        super(props);
        this.state = {
            projectData:[],
            jiraProjectData: [],
            yapiProjectData: [],
            weeklyProjectData: [],
            visible: false,
            checkedList:'',
            indeterminate: true,
            checkAll: false,
            modelTitle:'',
            detailData:null,
            update:false,
            look:false,
            total:0,
            current:1,
            projectPageData:[],
            hookType: '0',
            tabsKey: '1',
        }
       // this.onChangePage = this.onChangePage.bind(this);
    }

    handleHook = (hookType) => {
        this.setState({
          hookType,
        })
    }

    //分页点击事件
    onChangePage = (page) => {
        console.log(page);
        let startData=(page-1)*10;
        let endData=page*10;
        let Datas=this.state.projectData.slice(startData,endData);
        console.log("page="+page+',,,datas='+Datas);
        this.setState({
            current: page,
            projectPageData:Datas,
        });
    }
    confirm=(e)=> {
        this.setState({
            visible: true,
            modelTitle:'创建群聊界面',
        });
    }
    cancel=(e)=>  {
        console.log(e);
        message.error('请先创建项目的钩子');
    }
    //获取项目信息
    async projectInfo(){
        let projectUrl=headURL+"/sendBitbucketInfo"
        let project=[];
        await axios.get(projectUrl)
            .then(function (response) {
                project=response.data.result;
                console.log(project);
            })
            .catch(function (error) {
                console.log(error);
            });
        let jiraProjectUrl=headURL+"/sendJiraInfo"
        let jiraProject=[];
        await axios.get(jiraProjectUrl)
            .then(function (response) {
                jiraProject=response.data.result;
                console.log(jiraProject);
            })
            .catch(function (error) {
                console.log(error);
            });
        let yapiProjectUrl=headURL+"/sendYApiInfo"
        let yapiProject=[];
        await axios.get(yapiProjectUrl)
            .then(function (response) {
                yapiProject=response.data.result;
            })
            .catch(function (error) {
                console.log(error);
            });
        let weeklyProjectUrl=headURL+"/sendWeeklyInfo";
        let weeklyProject=[];
        await axios.get(weeklyProjectUrl)
            .then(function (response) {
                weeklyProject=response.data.result;
            })
            .catch(function (error) {
                console.log(error);
            });
        await this.setState({
          projectData:project,
          total:project.length,
          jiraProjectData:jiraProject,
          yapiProjectData: yapiProject,
          weeklyProjectData: weeklyProject,
        });
        await this.onChangePage(1);
    }
    async componentDidMount(){
        await this.projectInfo();
        let  url=headURL+"/sendWeChatMembers"
        //获取企业微信所有账号
        await axios.get(url)
            .then(function (response) {
                let datas =response.data.result
                console.log(datas);
                //将获取的数据转为数组
                var arr = []
                for (let i in datas) {
                    let o = {};
                    o[i] = datas[i];
                    arr.push(o)
                }
                //将数组转为需要的格式
                arr.map((item) => {
                    //json数据转为字符串并去掉指定符号，然后根据“：”分割
                    var m = JSON.stringify(item).replace(/[&\\^%$#{}""@]/g,"").split(":");
                    options.push({label:m[1],value:m[0]})
                    return options;
                });
            })
            .catch(function (error) {
                console.log(error);
            });
        await this.onChangePage(1);
    }
    //新建项目群聊
    addProject=(values)=>{
        let userAddInfo={
            ...values,
            fname:this.state.checkedList,
            owner:this.state.checkedList[0]
        }
        console.log("userAddInfo="+userAddInfo);
        let url=headURL+"/createChat";
        var that=this;
        if (userAddInfo.fname.length>1){
            axios.post(url, userAddInfo).then(function (response) {
                that.projectInfo();
                message.success('添加成功');
            }).catch(function (error) {
                alert(error);
            });
        } else if (userAddInfo.fname.length===1) {
            message.error('添加失败：一个人是不能建群的呦！');
        }else if (userAddInfo.fname.length===0) {
            message.error('添加失败：请选择群聊人员');
        }

    }
    //两数组相同的值
    getArrEqual=(arr1, arr2)=>{
        let newArr = [];
        for (let i = 0; i < arr2.length; i++) {
            for (let j = 0; j < arr1.length; j++) {
                if(arr1[j] === arr2[i]){
                    newArr.push(arr1[j]);
                }
            }
        }
        return newArr;
    }
    //两数组不相同的值
    arrChange=( a, b )=>{
        let c=[];
        for (var i = 0; i < a.length; i++) {
            if(b.indexOf(a[i])===-1){
                c.push(a[i])
            }
        }
        return c;
    }
    //警告不可删除群内所有成员
    error=() =>{
        Modal.error({
            title: '警告',
            content: '不可以删除原来所有成员',
        });
    }
    //修改群聊信息
    updateProject=(values)=>{
        //获取原来的成员
        let oldnumber=this.state.detailData.fname;
        console.log('oldnumber1='+this.state.checkedList);
        //不变的成员
        let newnumber =this.getArrEqual(oldnumber,this.state.checkedList) ;
        console.log('oldnumber2='+this.state.checkedList+"wewewerw="+newnumber);
        //新添的成员
        let addnumber=this.arrChange(this.state.checkedList,newnumber);
        //移除的成员
        let deletenumber=this.arrChange(oldnumber,newnumber);
        let updateInfo={
            ...values,
            addnumber:addnumber,
            fname:this.state.checkedList,
            deletenumber:deletenumber,
            owner:this.state.checkedList[0],
            chatid:this.state.detailData.chatid
        }

        let isExit =this.getArrEqual(oldnumber,this.state.checkedList) ;
        if (isExit.length>=1){
            let url=headURL+"/updateAppChat";
            var that=this;
            axios.post(url, updateInfo).then(function (response) {
                that.projectInfo();
                message.success('修改成功');
            }).catch(function (error) {
                alert(error);
            });
        } else {
            return(
                <div>
                    <Button onClick={this.error()}>Error</Button>
                </div>
            )
        }

    }
     handleOk = () => {
          this.props.form.validateFields((errors,values) =>{
            if (!errors){
                if (this.state.update){
                    this.updateProject(values);
                    //return;
                } else {
                    this.addProject(values);
                    // this.handleCancel();
                    // return;
                }
                this.handleCancel();
            }
        })
    }
    handleCancel = () => {
        this.setState({
            visible: false,
            detailData:null,
            update:false,
            look:false,
            hookType: '0',
            tabsKey: '1',
        });
    }
    onChange = (checkedList) => {
        console.log("checked=",checkedList);
        this.setState({
            checkedList,
            indeterminate: !!checkedList.length && (checkedList.length < options.length),
            checkAll: checkedList.length === options.length,
        });
    }
    //打开修改信息界面
    projectDetail=(item)=>{
        this.setState({
            visible: true,
            modelTitle:'修改群聊详情',
            checkedList:item.fname,
            detailData:item,
            update:true,
        });
    }
    //打开查看信息详情界面
    projectLook=(item)=>{
        this.setState({
            visible: true,
            modelTitle:'查看群聊详情',
            detailData:item,
            look:true,
        }, () => {
          // console.log('look', this.state.hookType, this.state.detailData)
        });
    }
    // 改变tabs key
    changeTabsKey = (key) => {
      this.setState({
        tabsKey: key,
      })
    }
    render() {
        const { getFieldDecorator}=this.props.form;
        const modalProps={
            title:this.state.modelTitle,
            visible:this.state.visible,
            onOk:this.handleOk,
            onCancel:this.handleCancel,
            destroyOnClose:true,
            footer:this.state.look ? [
                    <Button type="primary" onClick={this.handleCancel}>关闭</Button>
                    ]:[
                        <Button type="primary" onClick={this.handleCancel}>取消</Button>,
                        <Button type="primary" onClick={this.handleOk}>确认</Button>
                    ]
        }
        return (
            <div>
                <Layout>
                    <Affix>
                        <Header style={{"color":"#fff",backgroundColor:'#448AEB'}}>
                            <h1 style={{marginLeft:'60px',color:'#fff',fontFamily: '黑体',fontSize:'2em'}}>
                                机器人后台管理
                            </h1>
                        </Header>
                    </Affix>

                    <Content>
                        <Row>
                            <Col span={2}/>
                            <Col span={12}>
                              <div style={{'padding':'50px'}}>
                                <Tabs defaultActiveKey="1" onChange={this.changeTabsKey}>
                                   <TabPane tab="Bitbucket群" key="1">
                                     <List
                                         itemLayout="horizontal"
                                         dataSource={this.state.projectPageData}
                                         renderItem={item => (
                                             <List.Item>
                                                     <List.Item.Meta
                                                         avatar={<IconFont type={"iconproject-copy"} style={{fontSize: '31px'}} spin/>}
                                                         title={item.pname}
                                                         description={item.groupname}
                                                     />
                                                     <Button type="primary" size="small" style={{backgroundColor:'#6C71B4',border:'#6C71B4',marginRight:'10px',fontSize:'1.1em',fontFamily:'微软雅黑'}} onClick={()=>this.projectLook(item)}>查看</Button>
                                                     <Button type="primary" size="small"style={{backgroundColor:'#488B64',border:'#488B64',fontSize:'1.1em',fontFamily:'微软雅黑'}}  onClick={()=>this.projectDetail(item)}>编辑</Button>
                                                     {/*<IconFont type="iconlook" onClick={()=>this.projectLook(item)} style={{fontSize: '31px',marginRight:'10px'}}/>*/}
                                                     {/*<IconFont type="iconedit" onClick={()=>this.projectDetail(item)} style={{fontSize: '31px'}}/>*/}
                                                 </List.Item>
                                         )}
                                     />
                                     <Pagination
                                         current={this.state.current}
                                         onChange={this.onChangePage}
                                         total={this.state.projectData.length}
                                         style={{float:'right'}}
                                     />
                                   </TabPane>
                                   <TabPane tab="Jira群" key="2">
                                     <List
                                         itemLayout="horizontal"
                                         dataSource={this.state.jiraProjectData}
                                         renderItem={item => (
                                             <List.Item>
                                                     <List.Item.Meta
                                                         avatar={<IconFont type={"iconproject-copy"} style={{fontSize: '31px'}} spin/>}
                                                         title={item.pname}
                                                         description={item.groupname}
                                                     />
                                                     <Button type="primary" size="small" style={{backgroundColor:'#6C71B4',border:'#6C71B4',marginRight:'10px',fontSize:'1.1em',fontFamily:'微软雅黑'}} onClick={()=>this.projectLook(item)}>查看</Button>
                                                     <Button type="primary" size="small"style={{backgroundColor:'#488B64',border:'#488B64',fontSize:'1.1em',fontFamily:'微软雅黑'}}  onClick={()=>this.projectDetail(item)}>编辑</Button>
                                                     {/*<IconFont type="iconlook" onClick={()=>this.projectLook(item)} style={{fontSize: '31px',marginRight:'10px'}}/>*/}
                                                     {/*<IconFont type="iconedit" onClick={()=>this.projectDetail(item)} style={{fontSize: '31px'}}/>*/}
                                                 </List.Item>
                                           )}
                                       />
                                     </TabPane>
                                   <TabPane tab="YApi群" key="3">
                                        <List
                                    itemLayout="horizontal"
                                    dataSource={this.state.yapiProjectData}
                                    renderItem={item => (
                                        <List.Item>
                                        <List.Item.Meta
                                    avatar={<IconFont type={"iconproject-copy"} style={{fontSize: '31px'}} spin/>}
                                    title={item.pname}
                                    description={item.groupname}
                                    />
                                    <Button type="primary" size="small" style={{backgroundColor:'#6C71B4',border:'#6C71B4',marginRight:'10px',fontSize:'1.1em',fontFamily:'微软雅黑'}} onClick={()=>this.projectLook(item)}>查看</Button>
                                    <Button type="primary" size="small"style={{backgroundColor:'#488B64',border:'#488B64',fontSize:'1.1em',fontFamily:'微软雅黑'}}  onClick={()=>this.projectDetail(item)}>编辑</Button>
                                    {/*<IconFont type="iconlook" onClick={()=>this.projectLook(item)} style={{fontSize: '31px',marginRight:'10px'}}/>*/}
                                    {/*<IconFont type="iconedit" onClick={()=>this.projectDetail(item)} style={{fontSize: '31px'}}/>*/}
                                </List.Item>
                                )}
                                    />
                                    </TabPane>
                                    <TabPane tab="周报群" key="4">
                                        <List
                                            itemLayout="horizontal"
                                            dataSource={this.state.weeklyProjectData}
                                            renderItem={item => (
                                                <List.Item>
                                                    <List.Item.Meta
                                                        avatar={<IconFont type={"iconproject-copy"} style={{fontSize: '31px'}} spin/>}
                                                        title={item.pname}
                                                        description={item.groupname}
                                                    />
                                                    <Button type="primary" size="small" style={{backgroundColor:'#6C71B4',border:'#6C71B4',marginRight:'10px',fontSize:'1.1em',fontFamily:'微软雅黑'}} onClick={()=>this.projectLook(item)}>查看</Button>
                                                    <Button type="primary" size="small"style={{backgroundColor:'#488B64',border:'#488B64',fontSize:'1.1em',fontFamily:'微软雅黑'}}  onClick={()=>this.projectDetail(item)}>编辑</Button>
                                                    {/*<IconFont type="iconlook" onClick={()=>this.projectLook(item)} style={{fontSize: '31px',marginRight:'10px'}}/>*/}
                                                    {/*<IconFont type="iconedit" onClick={()=>this.projectDetail(item)} style={{fontSize: '31px'}}/>*/}
                                                </List.Item>
                                            )}
                                        />
                                    </TabPane>
                                   </Tabs>
                              </div>
                            </Col>
                            <Col span={10}>
                                <Popconfirm title={ <p>请问是否在hook上<a href={"http://192.168.214.112:7070/bitbucket/projects"}>配置</a>相关信息，如果没有，请联系管理员配置并获取项目id。<br /> <span style={{color:'red'}}>注意：配置中url必须为http://192.168.214.134:30778</span></p>}
                                            onConfirm={this.confirm} onCancel={this.cancel} okText="Yes" cancelText="No">
                                    <IconFont type={"iconadd"} style={{position:'fixed',top:'40%',right:'20%',fontSize: '86px'}}/>
                                    {/*<Icon type="plus-square" theme="twoTone" style={{position:'fixed',top:'40%',right:'20%',fontSize: '86px'}}/>*/}
                                </Popconfirm>
                            </Col>
                        </Row>
                        <Modal {...modalProps}>
                            <Form>
                                {
                                    <FormItem {...formItemOneLayout} label={"钩子类型"}>
                                        {getFieldDecorator('hookType',{
                                            rules:[
                                                {required:true,message:'请选择钩子类型！'},
                                            ],
                                            initialValue:this.state.detailData === null?'0':this.state.detailData.hookType,
                                        })(
                                            <Select onSelect={this.handleHook} disabled={this.state.look || this.state.update}>
                                                <Select.Option value='0' key='0'>Bitbucket</Select.Option>
                                                <Select.Option value='1' key='1'>Jira</Select.Option>
                                                <Select.Option value='2' key='2'>YApi</Select.Option>
                                                <Select.Option value='3' key='3'>周报</Select.Option>
                                            </Select>
                                        )}
                                    </FormItem>
                                }
                                <FormItem {...formItemOneLayout} label={"群名"}>
                                    {getFieldDecorator('groupname',{
                                        rules:[
                                            {required:true,message:'请设置群名称！'},
                                        ],
                                        initialValue:this.state.detailData === null?'':this.state.detailData.groupname,
                                    })(
                                        <Input disabled={this.state.look}/>
                                    )}
                                </FormItem>
                                {
                                  this.state.hookType === '1' && (
                                    <FormItem {...formItemOneLayout} label={"群类型"}>
                                        {getFieldDecorator('groupType',{
                                            rules:[
                                                {required:true,message:'请选择群类型！'},
                                            ],
                                            initialValue:this.state.detailData === null?'10103':this.state.detailData.groupType,
                                        })(
                                            <Select disabled={this.state.look || this.state.update}>
                                              <Select.Option value='10103' key='10103'>开发任务</Select.Option>
                                              <Select.Option value='10005' key='10005'>系统缺陷</Select.Option>
                                            </Select>
                                        )}
                                    </FormItem>
                                  )
                                }
                                {
                                  (this.state.detailData !== null && !!this.state.detailData.groupType) && (
                                    <FormItem {...formItemOneLayout} label={"群类型"}>
                                        {getFieldDecorator('groupType',{
                                            rules:[
                                                {required:true,message:'请选择群类型！'},
                                            ],
                                            initialValue:this.state.detailData === null?'10103':this.state.detailData.groupType,
                                        })(
                                            <Select onSelect={this.handleHook} disabled={this.state.look || this.state.update}>
                                              <Select.Option value='10103' key='10103'>开发任务</Select.Option>
                                              <Select.Option value='10005' key='10005'>系统缺陷</Select.Option>
                                            </Select>
                                        )}
                                    </FormItem>
                                  )
                                }
                                <FormItem {...formItemOneLayout} label={"参与成员"}>
                                    {getFieldDecorator('fname',{
                                        // rules:[
                                        //     {required:true,message:'请选择参与成员'},
                                        //     {
                                        //         validator:this.checkFname
                                        //     },
                                        // ],
                                    })(
                                        <div>
                                            {/*<div style={{ borderBottom: '1px solid #E9E9E9' }}>*/}
                                                {/*<Checkbox*/}
                                                    {/*indeterminate={this.state.indeterminate}*/}
                                                    {/*onChange={this.onCheckAllChange}*/}
                                                    {/*checked={this.state.checkAll}*/}
                                                {/*>*/}
                                                    {/*Check all*/}
                                                {/*</Checkbox>*/}
                                            {/*</div>*/}
                                            {/*<CheckboxGroup options={plainOptions} value={this.state.checkedList} onChange={this.onChange} />*/}
                                            <CheckboxGroup disabled={this.state.look} options={options} defaultValue={this.state.detailData === null?[]:this.state.detailData.fname} onChange={this.onChange}/>
                                        </div>
                                    )}
                                </FormItem>
                                {
                                    (this.state.hookType !== '1' && this.state.hookType !== '3' && this.state.detailData === null) && (
                                        <FormItem {...formItemOneLayout}
                                                  label={"项目id"}
                                                  extra="项目设置的存储库详细信息里呦！">
                                            {getFieldDecorator('pid',{
                                                rules:[
                                                    {required:true,message:'请输入项目id！',},
                                                    // {validator:this.validateToNextPassword,}
                                                ],
                                                initialValue:this.state.detailData === null?'':this.state.detailData.pid,
                                            })(
                                                <Input disabled={this.state.look}/>

                                            )}
                                        </FormItem>
                                    )
                                }
                                {
                                  (this.state.detailData !== null && this.state.detailData.hookType !== '1' && this.state.detailData.hookType !== '3') && (
                                    <FormItem {...formItemOneLayout}
                                              label={"项目id"}
                                              extra="项目设置的存储库详细信息里呦！">
                                        {getFieldDecorator('pid',{
                                            rules:[
                                                {required:true,message:'请输入项目id！',},
                                                // {validator:this.validateToNextPassword,}
                                            ],
                                            initialValue:this.state.detailData === null?'':this.state.detailData.pid,
                                        })(
                                            <Input disabled={this.state.look}/>

                                        )}
                                    </FormItem>
                                  )
                                }
                                {
                                    this.state.hookType === '1' && (
                                        <FormItem {...formItemOneLayout}
                                                  label={"项目关键字"}
                                                  extra="项目详情的关键字！">
                                            {getFieldDecorator('pid',{
                                                rules:[
                                                    {required:true,message:'请输入项目关键字！',},
                                                    // {validator:this.validateToNextPassword,}
                                                ],
                                                initialValue:this.state.detailData === null?'':this.state.detailData.pid,
                                            })(
                                                <Input disabled={this.state.look}/>

                                            )}
                                        </FormItem>
                                    )
                                }
                                {
                                  (this.state.detailData !== null && this.state.detailData.hookType === '1') && (
                                    <FormItem {...formItemOneLayout}
                                              label={"项目关键字"}
                                              extra="项目详情的关键字！">
                                        {getFieldDecorator('pid',{
                                            rules:[
                                                {required:true,message:'请输入项目关键字！',},
                                                // {validator:this.validateToNextPassword,}
                                            ],
                                            initialValue:this.state.detailData === null?'':this.state.detailData.pid,
                                        })(
                                            <Input disabled={this.state.look}/>

                                        )}
                                    </FormItem>
                                  )
                                }
                                {
                                    (this.state.hookType !== '3' && this.state.detailData === null) && (
                                        <FormItem {...formItemOneLayout} label={"项目名"}>
                                            {getFieldDecorator('pname',{
                                                rules:[
                                                    {required:true,message:'请输入项目名称！',},
                                                ],
                                                initialValue:this.state.detailData === null?'':this.state.detailData.pname,
                                            })(
                                                <Input disabled={this.state.look}/>
                                            )}
                                        </FormItem>
                                    )
                                }
                                {
                                    (this.state.detailData !== null && this.state.detailData.hookType !== '3') && (
                                        <FormItem {...formItemOneLayout} label={"项目名"}>
                                            {getFieldDecorator('pname',{
                                                rules:[
                                                    {required:true,message:'请输入项目名称！',},
                                                ],
                                                initialValue:this.state.detailData === null?'':this.state.detailData.pname,
                                            })(
                                                <Input disabled={this.state.look}/>
                                            )}
                                        </FormItem>
                                    )
                                }
                            </Form>
                        </Modal>
                    </Content>
                </Layout>
            </div>
        );
    }
}
export default Form.create()(Robot);
