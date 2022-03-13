import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import styled from "styled-components";

// const socket = io("http://localhost:3003");

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;

const DisplayBox = styled.div`
  width: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const RoomForm = styled.form``;
const RoomInput = styled.input``;
const RoomButton = styled.button``;

const VideoBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const Video = styled.video`
  width: 200px;
  border-radius: 10px;
`;
const VideoButtonBox = styled.div``;
const VideoButton = styled.button``;
const CameraSelect = styled.select``;

function App() {
  const myVideo = useRef(null);
  const otherVideo = useRef(null);

  const [myStream, setMyStream] = useState(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [deviceId, setDeviceId] = useState();

  function handleMute() {
    myStream
      .getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    muted ? setMuted(false) : setMuted(true);
  }
  const handleCamera = () => {
    myStream
      .getVideoTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    cameraOff ? setCameraOff(false) : setCameraOff(true);
  };
  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const checkcameras = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setCameras(checkcameras);
    } catch (error) {
      console.log(error);
    }
  };
  const handleCameraChange = async (e) => {
    await getMedia(e.target.value);
  };

  const getMedia = async (deviceId) => {
    const initialConstrains = {
      audio: true,
      video: { facingMode: "user" },
    };
    const cameraConstraints = {
      audio: true,
      video: { deviceId: { exact: deviceId } },
    };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        deviceId ? cameraConstraints : initialConstrains
      );
      myVideo.current.srcObject = stream;
      setMyStream(stream);
      if (!deviceId) {
        await getCameras();
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getMedia();
  }, []);

  return (
    <Container>
      <h1>HELLO WORLD</h1>
      <DisplayBox>
        <RoomForm>
          <RoomInput type="text" placeholder="Room Name" />
          <RoomButton>ENTER</RoomButton>
        </RoomForm>
      </DisplayBox>
      <VideoBox>
        <Video ref={myVideo} autoPlay muted playsInline></Video>
        <VideoButtonBox>
          <VideoButton onClick={handleMute}>
            {muted ? "unMute" : "Muted"}
          </VideoButton>
          <VideoButton onClick={handleCamera}>
            {cameraOff ? "camera On" : "camera Off"}
          </VideoButton>
        </VideoButtonBox>
        <CameraSelect onChange={handleCameraChange}>
          {cameras.map((camera, index) => (
            <option key={index} value={camera.deviceId}>
              {camera.label}
            </option>
          ))}
        </CameraSelect>
      </VideoBox>
      <VideoBox>
        <Video ref={otherVideo} autoPlay muted playsInline></Video>
      </VideoBox>
    </Container>
  );
}

export default App;
