import styles from "./App.module.less";
import { List, Upload } from 'antd'
// import { useRequest } from 'ahooks'

function App() {
  // const [count, setCount] = useState(0)
  // useRequest(() => fetch('/api/common/compressImage', {method: 'post'}))

  return (
    <div className={styles.wrapper}>
      <Upload listType="picture-circle" action="/api/common/compressImage">
        上传
      </Upload>
      <List>
        
      </List>
    </div>
  );
}

export default App;
