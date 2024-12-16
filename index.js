var dom = document.getElementById('chart-container');
var myChart = echarts.init(dom, null, {
  renderer: 'canvas',
  useDirtyRect: false
});
var app = {};
var option;

myChart.showLoading();
$.getJSON('./sandbox.config.json', function (graph) {
  myChart.hideLoading();
  
  // 預加載所有圖片
  const imagePromises = graph.nodes.map(node => {
    return new Promise((resolve, reject) => {
      if (node.image) {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = node.image;
      } else {
        resolve();
      }
    });
  });

  Promise.all(imagePromises).then(() => {
    graph.nodes.forEach(function (node) {
      // 設置節點樣式
      node.symbol = node.image ? 'image://' + node.image : 'circle';
      node.label = {
        show: true,
        position: 'bottom',
        distance: 5,
        fontSize: 14,
        color: '#333'
      };
      node.fixed = false;
      
      // 設置節點樣式
      node.itemStyle = {
        borderWidth: 2,
        borderColor: node.category === 0 ? '#c23531' : '#2f4554'
      };
    });

    console.log('Links data:', graph.links);

    option = {
      title: {
        text: '封神榜英雄關係圖',
        subtext: '可拖曳調整位置 | 雙擊固定位置',
        top: 'top',
        left: 'right'
      },
      tooltip: {
        formatter: function(params) {
          if (params.dataType === 'node') {
            return `${params.name}<br/>陣營：${graph.categories[params.data.category].name}`;
          }
          return params.name;
        }
      },
      legend: {
        data: graph.categories.map(a => a.name),
        orient: 'vertical',
        left: 'left',
        top: 'middle'
      },
      animationDuration: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          name: '封神榜',
          type: 'graph',
          layout: 'none',
          data: graph.nodes,
          links: graph.links.map(link => ({
            source: link.source,
            target: link.target,
            value: link.value,
            name: link.name,
            label: {
              show: true,
              formatter: link.name,
              fontSize: 15,
              color: '#666',
              backgroundColor: 'rgba(255,255,255,0.7)',
              padding: [4, 8],
              borderRadius: 4,
              draggable: true,
              cursor: 'move',
              distance: 0,
              position: 'middle',
              rotate: 0
            }
          })),
          categories: graph.categories,
          roam: true,
          draggable: true,
          label: {
            show: true,
            position: 'bottom',
            formatter: '{b}'
          },
          edgeLabel: {
            show: true,
            position: 'middle',
            formatter: '{c}',
            fontSize: 22,
            color: '#666',
            backgroundColor: 'rgba(255,255,255,0.7)',
            padding: [4, 8],
            borderRadius: 4,
            draggable: true,
            cursor: 'move',
            distance: 0,
            align: 'center',
            verticalAlign: 'middle'
          },
          lineStyle: {
            color: '#666',
            curveness: 0.3,
            width: 2
          },
          emphasis: {
            focus: 'adjacency',
            edgeLabel: {
              show: true,
              fontSize: 14,
              backgroundColor: 'rgba(255,255,255,0.9)'
            }
          },
          animation: true,
          animationDuration: 300,
          animationEasingUpdate: 'quinticInOut'
        }
      ]
    };
    myChart.setOption(option);
  });
});

if (option && typeof option === 'object') {
  myChart.setOption(option);
}

window.addEventListener('resize', myChart.resize);

// 添加雙擊事件來固定/解除固定節點
myChart.on('dblclick', function (params) {
  if (params.dataType === 'node') {
    params.data.fixed = !params.data.fixed;
    // 更新節點樣式以顯示固定狀態
    params.data.itemStyle = {
      ...params.data.itemStyle,
      borderWidth: params.data.fixed ? 4 : 2,
      shadowBlur: params.data.fixed ? 20 : 0,
      shadowColor: params.data.category === 0 ? '#c23531' : '#2f4554'
    };
    myChart.setOption(option);
  }
});

// 添加點擊事件顯示詳細信息
myChart.on('click', function (params) {
  if (params.dataType === 'node') {
    console.log('點擊節點：', params.data.name);
    // 這裡可以添加顯示詳細信息的邏輯
  }
});

// 監聽拖曳開始
myChart.on('labelDragging', function (params) {
  document.body.classList.add('dragging');
  console.log('Dragging:', params);
});

// 監聽拖曳過程
myChart.on('labelDragMove', function (params) {
  console.log('Moving:', params);
});

// 監聽拖曳結束
myChart.on('labelDragEnd', function (params) {
  document.body.classList.remove('dragging');
  console.log('Drag ended:', params);
});

// 添加點擊事件
myChart.on('click', function (params) {
  if (params.dataType === 'edge') {
    console.log('Clicked edge:', params);
  }
});