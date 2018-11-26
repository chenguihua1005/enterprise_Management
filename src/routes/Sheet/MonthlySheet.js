import React, { PureComponent} from 'react';
import { Divider } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
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
  Radio,
  Tooltip,
  Icon,
  Tabs,
  Cascader 
} from 'antd';
import {
  Bar, 
} from 'components/Charts';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { getTimeDistance } from '../../utils/utils';
import Authorized from '../../utils/Authorized';
import styles from './Sheet.less';
import NumberInfo from 'components/NumberInfo';
import numeral from 'numeral';
const { Secured } = Authorized;
const FormItem = Form.Item;
const InputGroup=Input.Group;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const havePermissionAsync = new Promise(resolve => {
  setTimeout(() => resolve(), 1000);
});
@Secured(havePermissionAsync)
@connect(({loading,sheet}) => ({
  sheet,
  loading: loading.effects['sheet/fetchMonthlySheet'],
}))

@Form.create()
export default class TableList extends PureComponent {
  state = {
    formValues: {},
    rangePickerValue: getTimeDistance('year'),
    tabTitle:"orderLiter",
    modelTitle:"加油月分布",
    mode:['month','month'],
    current:1,
    totalOrderNum:0,
    totalMoney:0,
    totalLiter:0,
    cityList:[],
    proviceIdList:[],
    branchName:["全部"],
    loading:false
  };

  componentDidMount() {
    const { dispatch } = this.props;
    //城市
    dispatch({
      type: 'sheet/fetchRegionList',
      payload:{
        level: 1,
        parentId: 1
      }
    }).then(()=>{
      const {sheet}=this.props;
      const {regionList}=sheet;
      const {proviceIdList}=this.state;
      //城市
      regionList.forEach(item=>{
        proviceIdList.push(<Option key={item.key} value={`${item.key},${item.regionName}`}>{item.regionName}</Option>);
      })
    });
    //月报表
    this.getMonthlySheet();
    //公共树
    dispatch({
      type: 'sheet/fetchCompanyTree'
    });
  }
  //请求月报表
  getMonthlySheet=()=>{
    const { dispatch } = this.props;
    const {rangePickerValue}=this.state;
    const [startValue,endValue]=rangePickerValue;
    const formatstartDate=startValue.format('YYYY-MM');
    const formatendDate=endValue.format('YYYY-MM');
    const params={
          page:"1",
          pageSize:"10",
          startTime:formatstartDate,
          endTime:formatendDate
        };
     //月报表
     dispatch({
      type: 'sheet/fetchMonthlySheet',
      payload: params,
    }).then(()=>{
      const {sheet}=this.props;
      const {monthlySheetList}=sheet;
      const {staticData}=monthlySheetList;
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
      rangePickerValue: getTimeDistance('year'),
      tabTitle:"orderLiter"
    });
    const [startValue,endValue]=getTimeDistance('year');
    const formatstartDate=startValue.format('YYYY-MM');
    const formatendDate=endValue.format('YYYY-MM');
    const params={
          page:"1",
          pageSize:"10",
          startTime:formatstartDate,
          endTime:formatendDate
        };
     //月报表
     dispatch({
      type: 'sheet/fetchMonthlySheet',
      payload: params,
    }).then(()=>{
      const {sheet}=this.props;
      const {monthlySheetList}=sheet;
      const {staticData}=monthlySheetList;
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
  handlePanelChange = (rangePickerValue, mode) => {
    this.setState({
      rangePickerValue,
      mode: [
        mode[0] === 'date' ? 'month' : mode[0],
        mode[1] === 'date' ? 'month' : mode[1],
      ],
    });
  }

  //模糊查询表单
  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    const {rangePickerValue,branchName}=this.state;
    const [startValue,endValue]=rangePickerValue;
    if(Object.keys(rangePickerValue).length!=0){
      const formatstartDate=startValue.format('YYYY-MM');
      const formatendDate=endValue.format('YYYY-MM');
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
          type: 'sheet/fetchMonthlySheet',
          payload: values,
        }).then(()=>{
          const {sheet}=this.props;
          const {monthlySheetList}=sheet;
          const {staticData}=monthlySheetList;
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
 //列表变化翻页的回调
 handleStandardTableChange = (pagination, filtersArg, sorter) => {
  const { dispatch, form } = this.props;
  const {rangePickerValue,branchName}=this.state;
  const [startValue,endValue]=rangePickerValue;
  const formatstartDate=startValue.format('YYYY-MM');
  const formatendDate=endValue.format('YYYY-MM');
    
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
      type: 'sheet/fetchMonthlySheet',
      payload: values,
    }).then(()=>{
        const {sheet}=this.props;
        const {monthlySheetList}=sheet;
        const {staticData}=monthlySheetList;
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
 //切换分页图形
handleTabCallback=(key)=>{
  this.setState({
    tabTitle:key
  });
}
 //处理柱状图数据
 reformatBarData=(bardata)=>{
  const {sheet}=this.props;
  const {monthlySheetList}=sheet;
  const {tabTitle}=this.state;
  const {chartData}=monthlySheetList;
  if(chartData){
    return bardata[tabTitle];
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
    const formatstartDate=startValue.format('YYYY-MM');
    const formatendDate=endValue.format('YYYY-MM');
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
      const params={//默认值
        startTime:formatstartDate, 
        endTime:formatendDate
      };
      const values = Object.assign(params,fieldsValue);
      dispatch({
        type: 'sheet/fetchMonthlyReport',
        payload: values,
      }).then(()=>{
        const { sheet } = this.props;
        const {monthlyReporList}=sheet;
        switch (monthlyReporList.err) {
          //err=0成功
          case 0:
            message.success(monthlyReporList.msg);
            window.open(monthlyReporList.res.path,'_self');
            break;
          default:
            message.warning(monthlyReporList.msg);
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
    const {companyTree}=treeList;
    const {cityList,proviceIdList}=this.state;
    // const proviceIdList=[]
    // //城市
    // regionList.forEach(item=>{
    //   proviceIdList.push(<Option key={item.key} value={`${item.key},${item.regionName}`}>{item.regionName}</Option>);
    // })
    const {rangePickerValue,mode}=this.state;

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
          <a className={this.isActive('year')} onClick={() => this.selectDate('year')}>
            今年
          </a>
          <a className={this.isActive('lastyear')} onClick={() => this.selectDate('lastyear')}>
            去年
          </a>
        </div>
        <RangePicker
          value={rangePickerValue}
          //  disabledDate={this.disabledDate}
            style={{width:'86%'}}
            onChange={this.handleRangePickerChange}
            format="YYYY-MM"                 
            mode={mode}
            onPanelChange={this.handlePanelChange}
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
    const {monthlySheetList}=sheet;
    const {chartData,dataCount,pageData}=monthlySheetList;
    const Info = ({ title, value, bordered }) => (
      <div className={styles.headerInfo}>
        <span>{title}</span>
        <p>{value}</p>
        {bordered && <em />}
      </div>
    );
    const {targetValue,tabTitle,current,totalOrderNum,totalMoney,totalLiter} = this.state;
    const barData=this.reformatBarData(chartData);
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
            <Tabs  size="large" tabBarStyle={{ marginBottom: 24 }} defaultActiveKey={tabTitle} onChange={this.handleTabCallback}>
              <TabPane tab="加油升量" key="orderLiter">
                    <div className={styles.salesBar}>
                    <Bar
                      height={350}
                      placeholder={placeholder}
                      padding={0}
                      data={barData}
                      GeomLabels={true} 
                      visible={true} 
                      HideXLabels={false}
                      title="默认显示今年的月数据"
                      type="orderLiter"
                    />
                    </div>
              </TabPane>
              <TabPane tab="加油金额" key="orderMoney">
                    <div className={styles.salesBar}>
                      <Bar
                        height={350}
                        padding={0}
                        placeholder={placeholder}
                        data={barData}
                        GeomLabels={true} 
                        visible={true} 
                        HideXLabels={false}
                        title="默认显示今年的月数据"
                        type="orderMoney"
                      />
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
        <Card bordered={false}>
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
