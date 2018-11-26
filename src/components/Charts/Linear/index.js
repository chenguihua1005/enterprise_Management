import React, { Component } from 'react';
import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';
import DataSet from '@antv/data-set';
import autoHeight from '../autoHeight';
import styles from './index.less';

@autoHeight()
export default class LinearChart extends React.Component {
  render() {
    const {
      title,
      height = 400,
      // padding = [60, 20, 40, 40],
      titleMap = {
        y1: 'y1',
        y2: 'y2',
        y3: 'y3',
        y4: 'y4',
        y5: 'y5',
        y6: 'y6',
        y7: 'y7',
      },
      borderWidth = 2,
      targetType,
      data = [
        {
          x: 0,
          y1: 0,
          y2: 0,
          y3: 0,
          y4: 0,
          y5: 0,
          y6: 0,
          y7: 0,
        },
      ],
      placeholder = null,
      type
    } = this.props;
    let dv = null;
    if (data.length > 0){
      const ds = new DataSet();
      dv = ds.createView().source(data);
      dv.transform({
          type: 'fold',
          fields: [titleMap.y1, titleMap.y2,titleMap.y3, titleMap.y4,titleMap.y5, titleMap.y6, titleMap.y7], // 展开字段集
          key: 'key', // key字段
          value: 'value', // value字段
      });
    }
    
    const tooltip = [
      'month*value',
      (month, value) => ({
        name: month,
        value: (value*100)+"%",
      }),
    ];
     const itemTpl= type=="liter"?'<li data-index={index}>'
     + '<span style="background-color:{color};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>'
     + '{name}: {value}'
     + ' L</li>' :'<li data-index={index}>'
     + '<span style="background-color:{color};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>'
     + '{name}: {value}'
     + ' 元</li>'

    
    return (
      <div className={styles.lineChart}>
        <div>
          {title && <h4>{title}</h4>}
          <Chart height={height} padding={'auto'} data={dv} forceFit placeholder={placeholder}>
            <Axis name="month" />
            <Axis name="value" label={{formatter(text,item,index){
              if(targetType&&targetType=="percentage"){
                return (text*100).toFixed(2)+"%";
              }else{
                return text;
              } 
            }}}/>
            <Legend name="key" position="top"/>
            <Tooltip showTitle={true}  crosshairs={{type:'line'}} itemTpl={itemTpl} />
            {/* <Tooltip showTitle={false} crosshairs={false} /> */}
            {/* tooltip={['month*value', (month, value) => {
              if(value){
                return {
                  //自定义 tooltip 上显示的 title 显示内容等。
                name:month,
                value: (value*100)+"%",
                };
              }
            }]} */}
            <Geom type="area" position="month*value" color='key' shape={"smooth"}/>
            <Geom type="line" position="month*value" size={2} color="key"  shape={"smooth"} />
          </Chart>
        </div>
      </div>
    );
  }
}

