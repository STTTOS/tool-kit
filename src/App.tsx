import styles from "./App.module.less";
import { List, Slider, Tag, Button, Empty, Image, Spin, message } from "antd";
import Dragger from "./components/Dragger";
import { InboxOutlined } from "@ant-design/icons";
import { useCallback, useMemo, useState } from "react";
import { domain } from "./constants";

async function uploadImage(
  file: File,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any> = {}
): Promise<FileInfo> {
  const formData = new FormData();
  formData.append("file", file);

  Object.entries(params).forEach(([key, value]) => formData.append(key, value));
  const res = await fetch(
    "https://www.wishufree.com/api/common/compressImage",
    {
      method: "POST",
      body: formData,
    }
  );
  return res.json().then((res) => res.data);
}

interface FileInfo {
  // 单位b
  originSize: number;
  compressedSize: number;
  url: string;
  filename: string;
}
function formatFileSize(size: number) {
  // < 1M
  if (size < 1000 * 1024) {
    return Math.floor(size / 1000) + "Kb";
  }
  return (size / 1000 / 1000).toFixed(2) + "Mb";
}
function App() {
  const [ratio, setRatio] = useState(30);
  const [fileList, setFileList] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const handleUpload = useCallback(async (file: File, params: object) => {
    setLoading(true);
    const data = await uploadImage(file, params).finally(() =>
      setLoading(false)
    );
    if (!data) {
      message.error("服务器内部错误");
      throw new Error("500");
    }

    const url = domain + data.url;
    setFileList((pre) => pre.concat({ ...data, url }));
    return url;
  }, []);

  const fileItems = useMemo(() => {
    if (fileList.length === 0) return <Empty />;

    return fileList.map(({ url, filename, originSize, compressedSize }) => {
      return (
        <List.Item
          key={url}
          actions={[
            <Button
              download={filename}
              href={url}
              className={styles.download}
              type="link"
            >
              下载
            </Button>,
          ]}
          extra={
            <Tag color="green">
              -
              {Math.floor(
                (Math.abs(originSize - compressedSize) * 100) / originSize
              )}
              %
            </Tag>
          }
        >
          <Image
            src={url}
            alt={filename}
            className={styles.img}
            width={60}
            height={60}
            wrapperClassName={styles.img}
            style={{ objectFit: "cover" }}
          />
          <List.Item.Meta
            title={filename}
            description={`大小: ${formatFileSize(compressedSize)}`}
          />
        </List.Item>
      );
    });
  }, [fileList]);
  return (
    <div className={styles.wrapper}>
      <h2>压缩率</h2>
      <Slider
        className={styles.ratio}
        value={ratio}
        tooltip={{
          open: true,
        }}
        min={5}
        max={80}
        marks={{
          10: <span style={{ color: "red" }}>10</span>,
        }}
        onChange={setRatio}
      />
      <Spin spinning={loading}>
        <Dragger
          multiple
          maxCount={1}
          maxSize={1024 * 50}
          showFileList={false}
          request={(file) => handleUpload(file, { ratio })}
          accept=".jpeg,.jpg,.png"
        >
          <div className={styles.dragger}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">拖拽或者点击上传</p>
            <p className="ant-upload-hint">支持文件格式: jpeg, jpg, png</p>
            <p className="ant-upload-hint">单个文件最大50M</p>
          </div>
        </Dragger>
      </Spin>

      <List header={<div>文件信息</div>} className={styles.fileList}>
        {fileItems}
      </List>
    </div>
  );
}

export default App;
