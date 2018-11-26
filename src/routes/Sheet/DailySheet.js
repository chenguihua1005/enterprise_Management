import React, { PureComponent} from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Divider } from 'antd';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Button,
  Table,
  message,
  DatePicker,
  Tabs,
  Radio,
  Tooltip,
  Icon,
  Cascader 
} from 'antd';
import {
  Linear, 
} from 'components/Charts';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { getTimeDistance } from '../../utils/utils';
import Authorized from '../../utils/Authorized';
import styles from './Sheet.less';
import NumberInfo from 'components/NumberInfo';
import numeral from 'numeral';
const { Secured } = Authorized;
const FormItem = Form.Item;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const havePermissionAsync = new Promise(resolve => {
  setTimeout(() => resolve(), 1000);
});

@Secured(havePermissionAsync)
@connect(({loading,sheet}) => ({
  sheet,
  loading: loading.effects['sheet/fetchDailySheet'],
}))

@Form.create()
export default class TableList extends PureComponent {
  state = {
    formValues: {},
    rangePickerValue: getTimeDistance('week'),
    tabTitle:"total_liter",
    modelTitle:"加油日分布",
    current:1,
    totalOrderNum:0,
    totalMoney:0,
    totalLiter:0,
    cityList:[],
    proviceIdList:[],
    branchName:"全部",
    loading:false
  };

  componentDidMount() {
    const { dispatch } = this.props;
    //城市
    dispatch({
      type: 'sheet/fetchRegionList',
      payload:{
        level: 1,
        parentId: 1}
    }).then(()=>{
      const {sheet}=this.props;
      const {regionList}=sheet;
      const {proviceIdList}=this.state;
      //城市
      regionList.forEach(item=>{
        proviceIdList.push(<Option key={item.key} value={`${item.key},${item.regionName}`}>{item.regionName}</Option>);
      })
    });
    //日报表
    this.getDailySheet();
    //公共树
    dispatch({
      type: 'sheet/fetchCompanyTree'
    });
  }
 
  //请求日报表
  getDailySheet=()=>{
    const { dispatch } = this.props;
    const {rangePickerValue}=this.state;
    const [startValue,endValue]=rangePickerValue;
    const formatstartDate=startValue.format('YYYY-MM-DD');
    const formatendDate=endValue.format('YYYY-MM-DD');
    const params={
          page:"1",
          pageSize:"10",
          startTime:formatstartDate,
          endTime:formatendDate
        };
     //日报表
     dispatch({
      type: 'sheet/fetchDailySheet',
      payload: params,
    }).then(()=>{
      const {sheet}=this.props;
      const {daliySheetList}=sheet;
      const {staticData}=daliySheetList;
      const {totalOrderNum,totalMoney,totalLiter}=staticData;
      this.setState({
        totalOrderNum:totalOrderNum,
        totalMoney:totalMoney,
        totalLiter:totalLiter
      });
    });
  }
 //重置
  handleFormReset = () => {
    const { form,dispatch} = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
      rangePickerValue: getTimeDistance('week'),
      tabTitle:"total_liter"
    });
    const [startValue,endValue]=getTimeDistance('week');
    const formatstartDate=startValue.format('YYYY-MM-DD');
    const formatendDate=endValue.format('YYYY-MM-DD');
    const params={
          page:"1",
          pageSize:"10",
          startTime:formatstartDate,
          endTime:formatendDate
        };
     //日报表
     dispatch({
      type: 'sheet/fetchDailySheet',
      payload: params,
    }).then(()=>{
      const {sheet}=this.props;
      const {daliySheetList}=sheet;
      const {staticData}=daliySheetList;
      const {totalOrderNum,totalMoney,totalLiter}=staticData;
      this.setState({
        totalOrderNum:totalOrderNum,
        totalMoney:totalMoney,
        totalLiter:totalLiter
      });
    });
  };

//选择的日期
  selectDate = type => {
    this.setState({
      rangePickerValue: getTimeDistance(type),
    });
  };
  //日期选中样式
  isActive(type) {
    const { rangePickerValue } = this.state;
    const value = getTimeDistance(type);
    if (!rangePickerValue[0] || !rangePickerValue[1]) {
      return;
    }
    if (
      rangePickerValue[0].isSame(value[0], 'day') &&
      rangePickerValue[1].isSame(value[1], 'day')
    ) {
      return styles.currentDate;
    }
  }
  //日期框设置值
  handleRangePickerChange = rangePickerValue => {
    this.setState({
      rangePickerValue,
    });
  };
  //列表变化翻页的回调
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch, form } = this.props;
    const {rangePickerValue,branchName}=this.state;
    const [startValue,endValue]=rangePickerValue;
    const formatstartDate=startValue.format('YYYY-MM-DD');
    const formatendDate=endValue.format('YYYY-MM-DD');
      
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const params={//默认值
        page: pagination.current,
        pageSize: pagination.pageSize,
        startTime:formatstartDate, 
        endTime:formatendDate
      };
      for (const prop in fieldsValue){
        if(fieldsValue[prop]===""||fieldsValue[prop]==="全部"||fieldsValue[prop]===undefined||prop==="proviceId"){
          delete fieldsValue[prop];
        }else if(prop=="branchId"){
          const brachId=JSON.parse(fieldsValue[prop][fieldsValue[prop].length-1]);
          fieldsValue[prop]=brachId;
          Object.assign(fieldsValue,{branchName:branchName});
        }else{
          fieldsValue[prop]=fieldsValue[prop].split(",")[0];
        }
      }
      const values = Object.assign(params,fieldsValue);
      dispatch({
        type: 'sheet/fetchDailySheet',
        payload: values,
      }).then(()=>{
          const {sheet}=this.props;
          const {daliySheetList}=sheet;
          const {staticData}=daliySheetList;
          const {totalOrderNum,totalMoney,totalLiter}=staticData;
          this.setState({
            totalOrderNum:totalOrderNum,
            totalMoney:totalMoney,
            totalLiter:totalLiter,
            current:pagination.current
          });
      });
    });
  };
  //模糊查询表单
  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    const {rangePickerValue,branchName}=this.state;
    const [startValue,endValue]=rangePickerValue;
    if(Object.keys(rangePickerValue).length!=0){
      const formatstartDate=startValue.format('YYYY-MM-DD');
      const formatendDate=endValue.format('YYYY-MM-DD');
      const params={//默认值
        page:"1",
        pageSize:"10",
        startTime:formatstartDate,
        endTime:formatendDate
      };
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        for (const prop in fieldsValue){
          if(fieldsValue[prop]===""||fieldsValue[prop]==="全部"||fieldsValue[prop]===undefined||prop==="proviceId"){
            delete fieldsValue[prop];
          }else if(prop=="branchId"){
            const brachId=JSON.parse(fieldsValue[prop][fieldsValue[prop].length-1]);
            fieldsValue[prop]=brachId;
            Object.assign(fieldsValue,{branchName:branchName});
          }else{
            fieldsValue[prop]=fieldsValue[prop].split(",")[0];
          }
        }
        const values = Object.assign(params,fieldsValue);
        this.setState({
          formValues: values,
        });
  
        dispatch({
          type: 'sheet/fetchDailySheet',
          payload: values,
        }).then(()=>{
          const {sheet}=this.props;
          const {daliySheetList}=sheet;
          const {staticData}=daliySheetList;
          const {totalOrderNum,totalMoney,totalLiter}=staticData;
          this.setState({
            totalOrderNum:totalOrderNum,
            totalMoney:totalMoney,
            totalLiter:totalLiter
          });
        });
      });
    }else{
      message.error("日期不能为空");
    }
  };

  //字段枚举类型
  columnsEnumFormat=(data)=>{
    if(data){
      const enumObj={};
      data.forEach((item)=>{
        enumObj[item.title]=item.titleName;
      })
      return enumObj;
    }
  }
  //取对应的标注数据
  titleChartMapSource=(data,targetTitle)=>{
    //与之前不同的处理方法，每次都是固定的类型可以写死
    if(data){
      let rObj={}
      for(const prop in data){
        if(prop==targetTitle){
          rObj["y1"]= data[prop];
        }
      }
      return rObj;
    }
  }
  //城市查地区
  onChangeCity=(value,option)=>{
    const {key}=option;
    const { dispatch } = this.props;
    //城市
    dispatch({
      type: 'sheet/fetchRegionList',
      payload:{
        level: 2,
        parentId: key}
    }).then(()=>{
      const {sheet}=this.props;
      const {regionList}=sheet;
      const cityList=[];
      regionList.forEach(item=>{
        cityList.push(<Option key={item.key} value={`${item.key},${item.regionName}`}>{item.regionName}</Option>);
      })
      this.setState({
        cityList:cityList
      })
    });
  }
  //格式化指标菜单数据
  reFormatOptions=(data,target,type)=>{//target出来是数组 与分布不同
    if(data&&target){
      let arr=target.filter((item)=>{
        return item.type==type;
      })
      let tmp=[];
      for(let i=0;i<arr.length;i++){
        let item=arr[i];
        tmp.push(<Option key={item["titleName"]}>{item["titleName"]}</Option>);
      }
      return tmp;
    }
  }
  //格式化分类列表
  reFormatSection=(target)=>{
    let tmp=[];
    let list=[];
    if(target){
      target.forEach((item)=>{
        if(tmp.indexOf(item.type)==-1){
          tmp.push(item.type);
          list.push(<Option key={item.type} value={item.type}>{item.typeName}</Option>);
        }
      })
    }
    return list;
  }

handleTabCallback=(key)=>{
  this.setState({
    tabTitle:key
  });
}
  //图形数据处理
  chartFormatData=(data,enumdata)=>{
    if(data){
      let reformat=data.map((item,index)=>{
        let newObj={};
        for(const prop in item){
          if(prop=="date"){
            newObj["month"]=item[prop];
          }else{
            newObj[enumdata[prop]]=item[prop];
          }
        }
        return newObj;
      });
      return reformat;
    }
  }
  //禁用当前日期之后的时间
  disabledDate=(current)=>{
    return current && current > moment().endOf('day');
  }
  onChangeCascader=(value,selectedOptions)=>{
    console.log(value);
   
    const label=selectedOptions[selectedOptions.length-1]["label"];
    this.setState({
      branchName:label
    })
  }
  //导出报表
  handleExport=()=>{
    const { dispatch, form } = this.props;
    const {rangePickerValue,branchName}=this.state;
    const [startValue,endValue]=rangePickerValue;
    const formatstartDate=startValue.format('YYYY-MM-DD');
    const formatendDate=endValue.format('YYYY-MM-DD');
    const params={//默认值
      startTime:formatstartDate, 
      endTime:formatendDate
    };
    this.setState({
      loading:true
    })
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      for (const prop in fieldsValue){
        if(fieldsValue[prop]===""||fieldsValue[prop]==="全部"||fieldsValue[prop]===undefined||prop==="proviceId"){
          delete fieldsValue[prop];
        }else if(prop=="branchId"){
          const brachId=JSON.parse(fieldsValue[prop][fieldsValue[prop].length-1]);
          fieldsValue[prop]=brachId;
          Object.assign(fieldsValue,{branchName:branchName});
        }else{
          fieldsValue[prop]=fieldsValue[prop].split(",")[0];
        }
      }
      const values = Object.assign(params,fieldsValue);
      dispatch({
        type: 'sheet/fetchDailyReport',
        payload: values,
      }).then(()=>{
        const { sheet } = this.props;
        const {daliyReporList}=sheet;
        switch (daliyReporList.err) {
          //err=0成功
          case 0:
            message.success(daliyReporList.msg);
            window.open(daliyReporList.res.path,'_self');
            break;
          default:
            message.warning(daliyReporList.msg);
        }
        this.setState({
          loading:false
        })
      });
    });
  }

  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;
    const {sheet}=this.props;
    const {treeList}=sheet;
    const {cityList,proviceIdList}=this.state;
    const {companyTree}=treeList;
    // const proviceIdList=[]
    // //城市
    // regionList.forEach(item=>{
    //   proviceIdList.push(<Option key={item.key} value={`${item.key},${item.regionName}`}>{item.regionName}</Option>);
    // })
    const {rangePickerValue}=this.state;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col md={8} sm={24}>
            <FormItem label="公司">
              {getFieldDecorator('branchId',{
                initialValue:["-1"],
                // initialText:'全部',
              }
              )(
                <Cascader options={companyTree} style={{ width: '100%' }}  onChange={this.onChangeCascader} changeOnSelect />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="城市">
              {getFieldDecorator('proviceId', {
                 initialValue:'全部',
                 initialText:'全部',
              })(
                <Select showSearch={true} style={{ width: '100%' }} onChange={this.onChangeCity}>
                  {proviceIdList}
               </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="地区">
              {getFieldDecorator('cityId', {
                 initialValue:'全部',
                 initialText:'全部',
              })(
                <Select showSearch={true} style={{ width: '100%' }}>
                  {cityList}
               </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col md={16} sm={24}>
          <FormItem label="时间">
            <div className={styles.salesExtraWrap}>
            <div className={styles.salesExtra}>
            <a className={this.isActive('week')} onClick={() => this.selectDate('week')}>
              本周
            </a>
            <a className={this.isActive('month')} onClick={() => this.selectDate('month')}>
              本月
            </a>
          </div>
            <RangePicker
              style={{width:'86%'}}
              value={rangePickerValue}
              disabledDate={this.disabledDate}
              onChange={this.handleRangePickerChange}
            />
          </div>
        </FormItem>
        </Col>
        <Col md={8} sm={24}>
              <div style={{ overflow: 'hidden' }}>
                <span style={{ float: 'right'}}>
                  <Button type="primary" htmlType="submit">
                    查询
                  </Button>
                  <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                    重置
                  </Button>
                  <Button style={{ marginLeft: 8 }} loading={this.state.loading} onClick={this.handleExport} icon="file-excel" >
                    导出
                  </Button>
                </span>
              </div>
          </Col>
      </Row>
      </Form>
    );
  }

  renderForm() {
    return this.renderAdvancedForm();
  }
 
  render() {
    const {sheet,loading} = this.props;
    const {daliySheetList}=sheet;
    const {chartData,dataCount,pageData,titleData}=daliySheetList;
    const Info = ({ title, value, bordered }) => (
      <div className={styles.headerInfo}>
        <span>{title}</span>
        <p>{value}</p>
        {bordered && <em />}
      </div>
    );
    const {targetValue,tabTitle,current,totalOrderNum,totalMoney,totalLiter} = this.state;
    //枚举类型的数据处理
    const enumData=this.columnsEnumFormat(titleData);
    // 取出对应的图形数据标注
    const titleMapSource=this.titleChartMapSource(enumData,tabTitle);
    const columnData = [
        {
          title: '日期',
          dataIndex: 'order_date',
        },
        {
          title: '公司名称',
          dataIndex: 'companyName',
        },
        {
          title: '城市',
          dataIndex: 'cityName',
        },
        {
          title: '总订单数',
          dataIndex: 'order_num',
        },
        {
          title: '总加油升量（L）',
          dataIndex: 'total_liter',
        },
        {
          title: '总金额（元）',
          dataIndex: 'total_price',
        }
      ];
    // //图形数据处理
    const chartFormat=this.chartFormatData(chartData,enumData);
    //分页属性设置
    const paginationProps={
      showQuickJumper: true,
      showSizeChanger:true,
      pageSizeOptions:['10','20','50','100'],
      total:dataCount,
      current:current,
      showTotal:()  => `共计 ${dataCount} 条`
    }
    const placeholder = (
      <div style={{ position: 'relative', top: '25%', textAlign: 'center'}}>
        <img style={{ width: '50%'}} src="/10.png"></img>
      </div>
    );
    return (
      <PageHeaderLayout>
        <div className={styles.standardList}>
        <Card
          bordered={false}
          style={{marginBottom: 24 }}
        >
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
          </div>
        </Card>
        <Card
            loading={loading}
            bordered={false}
            style={{ marginBottom: 24 }}
          >
          <div className={styles.salesCard}>
            <Tabs size="large" tabBarStyle={{ marginBottom: 24 }} defaultActiveKey={tabTitle} onChange={this.handleTabCallback}>
              <TabPane tab="加油升量" key="total_liter">
                    <div className={styles.salesBar}>
                      <Linear height={295} title="默认显示最近一周的日数据" data={chartFormat} titleMap={titleMapSource} targetType={targetValue} placeholder={placeholder} type="liter"/>
                    </div>
              </TabPane>
              <TabPane tab="加油金额" key="total_price">
                    <div className={styles.salesBar}>
                      <Linear height={295}  title="默认显示最近一周的日数据"data={chartFormat} titleMap={titleMapSource} targetType={targetValue} placeholder={placeholder} type="price" />
                    </div>
              </TabPane>
            </Tabs>
          </div>
        </Card>
        <Card bordered={false} style={{ marginBottom: 24 }}>
            <Row>
              <Col sm={8} xs={24}>
                <Info title="总订单数" value={`${numeral(totalOrderNum).format('0,0')}`} bordered />
              </Col>
              <Col sm={8} xs={24}>
                <Info title="总加油升量" value={`${numeral(totalMoney).format('0,0')}`}  bordered />
              </Col>
              <Col sm={8} xs={24}>
                <Info title="总加油金额" value={`${numeral(totalLiter).format('0,0')}`}  />
              </Col>
            </Row>
          </Card>
        <Card bordered={false} >
        <Divider orientation="left">报表明细</Divider>
          <div className={styles.tableList}  >
            <Table
              loading={loading}
              pagination={paginationProps}
              size={"small"}
              rowKey={'key'}
              dataSource={pageData}
              columns={columnData}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        </div>
      </PageHeaderLayout>
    );
  }
}
