
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    ctor : function()
    {
        console.log("mapCtrl 构造函数初始化");
        this.mapPanel = arguments[0];
    },

    SetUp(args)
    {   
        console.log("mapCtrl SetUp(args)");
        console.log(args);
        this.args = args;
        this.CreateView();
        this.CreatMap(this.args.missionId);
        //this.CreatMap('10101');
    },

    //创建表现层
    CreateView()
    {
        var mapView = require("MapView");
        this.mapView = new mapView(this);

        var chooseNodePool = require("ChooseNodePool");
        this.chooseNodePool = new chooseNodePool(this);

        var mapUIInfoPanel = require("MapUIInfoPanel");
        this.mapUIInfoPanel = new mapUIInfoPanel(this);
    },

    //加载地图数据
    LoadMap(missionId, callBack)
    {
        var jsonPath = "Json/MapJson/" + missionId;      //地图数据
        cc.loader.loadRes(jsonPath, function(err, res) {
            if (err) {
                console.log(err);
                return;
            }
            this.mapJson = res.json;
            if(callBack != null)
            {
                callBack();
            };
        }.bind(this));
    },

    //创建地图，包括UI, 选择的池子
    CreatMap(missionId)
    {
        cc.Mgr.AudioMgr.closeSFX();
        this.state = 0; //无状态
        this.LoadMap(missionId, function(){
            this.mapView.Create();
            this.chooseNodePool.Create();
            this.mapUIInfoPanel.Create();
        }.bind(this));
    },

    //清理地图（数据层面上的清理,地图节点将会被清理）
    ClearMap()
    {
        this.mapView.ClearMap();
        this.mapUIInfoPanel.Close();
        this.chooseNodePool.Close();
    },

    //通关
    CompleteChater()
    {
        this.state = 1; //结算状态
        this.mapUIInfoPanel.StopRecordTime();
        //ToDo:获取时间判定那颗星
        var timeResult = this.mapUIInfoPanel.JudgeStar();
        var mapStarResult = this.mapView.JudgeStar();

        let data = {};
        data['isWin'] = true;
        data['starTime'] = this.mapJson.starTime.toString();
        data['star'] = {};
        data['star'][1] = true;
        data['star'][2] = timeResult;   
        data['star'][3] = mapStarResult;

        data.missionId = this.mapJson.missionId;
        data.missionName = this.mapJson.missionName;
        //ToDo:弹出胜利面板
        console.log("弹出胜利面板");
        console.log(data);

        let args = {
            data : data,
            callBack : function(missionId){
                this.CreatMap(missionId);
            }.bind(this),
        };
        
        let starNum = 0;
        for (let index = 1; index <= 3; index++) {
            if(data.star[index] == true)
            {
                starNum = starNum + 1;
            };
        }

        console.log(this.mapJson.missionId.toString(), starNum);
        cc.Mgr.UserDataMgr.UpdateuserData(this.mapJson.missionId.toString(), starNum);
        this.mapView.StartTrianAnim(() =>{
            cc.Mgr.PanelMgr.OpenWindow("ChallengeResult", args, "Map");
        });
    },

    CheckState()
    {
        return this.state;
    },

    //表现层关闭
    CloseMap()
    {
        this.mapView.Close();
        this.mapUIInfoPanel.Close();
        this.chooseNodePool.Close();
    },

    //
    OpenMap()
    {
        this.mapView.Open();
        this.mapUIInfoPanel.Open();
        this.chooseNodePool.Open();
    },

    BackClick()
    {
        console.log("从地图返回");
        cc.Mgr.PanelMgr.ChangePanel("Start", {});
    },

    Destroy()
    {
        this.mapView.OnDestroy();
        this.mapUIInfoPanel.OnDestroy();
        this.chooseNodePool.OnDestroy();
    },

});
