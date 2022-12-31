<template>
  <div class="sku">
    <el-form :model="formData" label-width="120px">
      <!--复选框数据-->
      <el-form-item :label="item.title" v-for="(item,index) in specData" :key="index">
        <div class="fairy-spec-table">
          <el-checkbox-group v-model="formData.checkboxGroup1" size="default">
            <el-checkbox :label="it.title" border v-for="(it,idx) in item.child" :key="idx" :checked="it.checked"
                         @change="handleChange(index,idx)"/>
          </el-checkbox-group>
        </div>
      </el-form-item>


      <!--批量设置数据-->
      <el-form-item v-if="tableData">
        <el-button-group>
          <el-button type="primary" size="small" @click="openDialog('price')">一键设置销售价格</el-button>
          <el-button type="primary" size="small" @click="openDialog('cost_price')">一键设置市场价格</el-button>
          <el-button type="primary" size="small" @click="openDialog('market_price')">一键设置成本</el-button>
          <el-button type="primary" size="small" @click="openDialog('stock')">一键设置库存</el-button>
        </el-button-group>
      </el-form-item>

      <!-- 动态sku表 -->
      <el-form-item label="SKU表：">
        <div class="fairy-spec-table">
          <el-table
              :data="tableData"
              border
              style="width: 100%"
          >
            <el-table-column prop="id" :label="item" width="80" align="center" v-for="(item,index) in tableData_title"
                             :key="index">
              <template #default="scope">
                {{ scope["row"]['data_title'][index]['title'] }}
              </template>
            </el-table-column>
            <el-table-column prop="price" label="销售价格">
              <template #default="scope">
                <el-input v-model="scope.row.price" placeholder="价格"/>
              </template>
            </el-table-column>
            <el-table-column label="市场价格">
              <template #default="scope">
                <el-input v-model="scope.row.cost_price" placeholder="市场价"/>
              </template>
            </el-table-column>
            <el-table-column label="成本价格">
              <template #default="scope">
                <el-input v-model="scope.row.market_price" placeholder="成本价"/>
              </template>
            </el-table-column>
            <el-table-column label="库存">
              <template #default="scope">
                <el-input v-model="scope.row.stock" placeholder="库存"/>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>

      <!--      formData-->
      <!--      <p>{{ formData }}</p>-->
      <!--      -&#45;&#45;&#45;&#45;&#45;&#45;specData-->
      <!--      <p>{{ specData }}</p>-->
      <!--      &#45;&#45;&#45;&#45; tableData-->
      <!--      <p>{{ tableData }}</p>-->
    </el-form>

    <!--弹窗-->
    <el-dialog v-model="dialogVisible" :title="visible_title" width="30%">
      <el-input-number v-model="visible_number" :min="1"/>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="btnVisible">确定</el-button>
      </span>
      </template>
    </el-dialog>


  </div>
</template>
<script setup>
import {onMounted, reactive, ref} from "vue"

const formData = reactive({
  checkboxGroup1: [],
})

// 复选框数据
let specData = reactive([
  {
    id: "1",
    title: "颜色",
    child: [
      {id: "1", title: "红色", checked: false},
      {id: "2", title: "黄色", checked: false},
      {id: "3", title: "蓝色", checked: false},
    ],
  },
  {
    id: "2",
    title: "尺码",
    child: [
      {id: "4", title: "S", checked: false},
      {id: "5", title: "M", checked: false},
      {id: "6", title: "L", checked: false},
      {id: "7", title: "XL", checked: false},
    ],
  },
  {
    id: "3",
    title: "款式",
    child: [
      {id: "8", title: "男款", checked: false},
      {id: "9", title: "女款", checked: false},
    ],
  },
  {
    id: "4",
    title: "型号",
    child: [
      {id: "10", title: "s", checked: false},
      {id: "11", title: "m", checked: false},
    ],
  },
])
//表格数据
const tableData = ref([])
const tableData_title = ref([])
// 勾选
const handleChange = (index, idx) => {
  //修改状态
  specData[index]["child"][idx]["checked"] = !specData[index]["child"][idx]["checked"]
  //获取显示表
  asyncCheckbox()
}

// 设置价格得
const dialogVisible = ref(false)
const visible_title = ref('')
const visible_type = ref('')
const visible_number = ref(1)
const openDialog = (type) => {
  if (type == 'price') {
    visible_title.value = "一键设置价格"
  } else if (type == 'cost_price') {
    visible_title.value = "一键设置市场价格"
  } else if (type == 'market_price') {
    visible_title.value = "一键设置成本价格"
  } else if (type == 'stock') {
    visible_title.value = "一键设置库存"
  }
  dialogVisible.value = true
  visible_type.value = type
}
const btnVisible = () => {
  tableData.value.forEach((item) => {
    item[visible_type.value] = visible_number.value
  })
  dialogVisible.value = false
}
const asyncCheckbox = () => {
  let list_data = []
  let data_list_title = []
  // 循环列表
  specData.forEach((item) => {
    // 如果有子级，就继续往下面走
    if (item.child.length !== 0) {
      let it_data = []
      // 再去循环它的child
      item.child.forEach((it) => {
        // 如果是选中得，就往it_data追加数据
        if (it.checked) {
          it_data.push({
            id: it.id,
            title: it.title,
          })
        }
      })
      // it_data有数据，就往list_data追加
      if (it_data.length !== 0) {
        // 追加
        list_data.push(it_data)
        // 追加
        data_list_title.push(item.title)
      }
    }
  })

   // console.log(list_data)
   // console.log(data_list_title)
  // 循环list_data  [[{"id":"1","title":"红色"},{"id":"2","title":"黄色"},{"id":"3","title":"蓝色"}],[{"id":"4","title":"S"}]]
  // data_list_title ["颜色","尺码"]


  let data_list = []
  let res_data = []
  list_data.forEach((arrayItem) => {
    // 是第一次
    if (data_list.length === 0) {
      arrayItem.forEach(item => {
        data_list.push([item])
      })
    } else {
      // 不是第一次
      const emptyArray = [];
      data_list.forEach((item) => {
        arrayItem.forEach((value) => {
          emptyArray.push([...item, value])
        })
      })
      data_list = emptyArray;
    }
  })

  // [[{"id":"1","title":"红色"},{"id":"4","title":"S"}],[{"id":"2","title":"黄色"},{"id":"4","title":"S"}],[{"id":"3","title":"蓝色"},{"id":"4","title":"S"}]]
  // console.log(data_list)

  tableData_title.value = data_list_title
  // 这里是核心
  data_list.forEach(item => {
    let ids = [];
    item.forEach((value) => {
      ids.push(value.id)
    })
    res_data.push({
      data_title: {
        ...item
      },
      specs_id: ids.join(','),
      price: "1111",
      stock: "",
      cost_price: "",
      image: "",
      market_price: "",
    })
  })

  console.log(res_data)
  tableData.value = res_data

  /**
   * [
   *     {
   *         "data_title": {
   *             "0": {
   *                 "id": "1",
   *                 "title": "红色"
   *             },
   *             "1": {
   *                 "id": "4",
   *                 "title": "S"
   *             }
   *         },
   *         "specs_id": "1,4",
   *         "price": "1111",
   *         "stock": "",
   *         "cost_price": "",
   *         "image": "",
   *         "market_price": ""
   *     },
   *     {
   *         "data_title": {
   *             "0": {
   *                 "id": "2",
   *                 "title": "黄色"
   *             },
   *             "1": {
   *                 "id": "4",
   *                 "title": "S"
   *             }
   *         },
   *         "specs_id": "2,4",
   *         "price": "1111",
   *         "stock": "",
   *         "cost_price": "",
   *         "image": "",
   *         "market_price": ""
   *     },
   *     {
   *         "data_title": {
   *             "0": {
   *                 "id": "3",
   *                 "title": "蓝色"
   *             },
   *             "1": {
   *                 "id": "4",
   *                 "title": "S"
   *             }
   *         },
   *         "specs_id": "3,4",
   *         "price": "1111",
   *         "stock": "",
   *         "cost_price": "",
   *         "image": "",
   *         "market_price": ""
   *     }
   * ]
   */
}
onMounted(() => {
  asyncCheckbox()
})
</script>
