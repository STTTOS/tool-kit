import styles from "./App.module.less";
import {
  List,
  Slider,
  Tag,
  Button,
  Empty,
  Image,
  Spin,
  message,
  Tooltip,
} from "antd";
import Dragger from "./components/Dragger";
import { InboxOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiUrl, domain } from "./constants";
import classNames from "classnames";
import { downloadAndZipImages, getRandomInt } from "./utils";
import AsyncTaskManager from "./utils/asyncTaskManager";
async function uploadImage(
  file: File,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any> = {}
): Promise<FileInfo> {
  const formData = new FormData();
  formData.append("file", file);

  Object.entries(params).forEach(([key, value]) => formData.append(key, value));
  const res = await fetch(apiUrl + "/api/common/compressImage", {
    method: "POST",
    body: formData,
  });
  return res.json().then((res) => res.data);
}

export interface FileInfo {
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

const animationSet = [
  // "animate__fadeInUp",
  // "animate__fadeInDown",
  "animate__fadeInLeft",
  "animate__fadeInRight",
  // "animate__fadeInTopLeft",
  // "animate__fadeInTopRight",
  "animate__rubberBand",
  "animate__flipInX",
  "animate__lightSpeedInRight",
  "animate__lightSpeedInLeft",
  "animate__rotateIn",
  "animate__rollIn",
];
const taskManager = new AsyncTaskManager();
function App() {
  const [ratio, setRatio] = useState(30);

  const [fileList, setFileList] = useState<
    Array<FileInfo & { animation: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const handleUpload = useCallback(async (file: File, params: object) => {
    taskManager.addTask(async () => {
      const data = await uploadImage(file, params);
      if (!data) {
        message.error("服务器内部错误");
        throw new Error("500");
      }
      const url = domain + data.url;
      setFileList((pre) => [
        { ...data, url, animation: getAnimation() },
        ...pre,
      ]);
    });
  }, []);

  console.log(fileList);
  const getAnimation = () => {
    const index = getRandomInt(0, animationSet.length - 1);
    return animationSet[index];
  };
  const downloadAll = () => {
    downloadAndZipImages(fileList);
  };
  const fileItems = useMemo(() => {
    if (fileList.length === 0) return <Empty />;

    return fileList.map(
      ({ url, filename, originSize, compressedSize, animation }) => {
        return (
          <List.Item
            className={classNames("animate__animated", animation)}
            key={url}
            actions={[
              <Button
                // download={filename}
                // href={url}
                className={styles.download}
                type="link"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = filename;
                  a.click();
                }}
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
              title={<div className={styles.title}>{filename}</div>}
              description={`大小: ${formatFileSize(compressedSize)}`}
            />
          </List.Item>
        );
      }
    );
  }, [fileList]);

  useEffect(() => {
    // taskManager.on("start", () => setLoading(true));
    // taskManager.on("end", () => setLoading(false));
    taskManager.onStatusChange(setLoading);
  }, []);

  return (
    <div className={styles.wrapper}>
      <Tooltip title="越小压缩越狠">
        <h2>压缩程度</h2>
      </Tooltip>
      <Slider
        className={styles.ratio}
        value={ratio}
        tooltip={{
          open: true,
        }}
        min={5}
        max={100}
        marks={{
          10: <span style={{ color: "red" }}>10</span>,
        }}
        onChange={setRatio}
      />
      <Dragger
        multiple
        maxCount={1}
        maxSize={1024 * 50}
        disabled={loading}
        showFileList={false}
        request={(file) => handleUpload(file, { ratio })}
        accept=".jpeg,.jpg,.png"
        className={styles.dragger}
      >
        <Spin spinning={loading}>
          <div>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">拖拽或者点击上传</p>
            <p className="ant-upload-hint">支持文件格式: jpeg, jpg, png</p>
            <p className="ant-upload-hint">单个文件最大50M</p>
          </div>
        </Spin>
      </Dragger>

      <List
        header={
          <div className={styles.list_header}>
            <span>文件信息</span>
            {fileList.length > 0 && (
              <Button
                type="link"
                onClick={downloadAll}
                className={styles.download}
              >
                全部下载
              </Button>
            )}
          </div>
        }
        className={styles.fileList}
      >
        {fileItems}
      </List>
    </div>
  );
}

export default App;
