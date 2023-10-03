import "@tensorflow/tfjs-backend-webgl";

import { IconHeart } from "@tabler/icons-react";
import {
  Card,
  Image,
  Text,
  Group,
  Badge,
  Button,
  ActionIcon,
  Center,
} from "@mantine/core";
import classes from "./BadgeCard.module.css";
import Webcam from "react-webcam";
import * as Model from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import "@mediapipe/pose";

import { useCallback, useEffect, useRef, useState } from "react";
const WIDTH = 640;
const HEIGHT = 480;
const mockdata = {
  image:
    "https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80",
  title: "Verudela Beach",
  country: "Croatia",
  description:
    "Completely renovated for the season 2020, Arena Verudela Bech Apartments are fully equipped and modernly furnished 4-star self-service apartments located on the Adriatic coastline by one of the most beautiful beaches in Pula.",
  badges: [
    { emoji: "☀️", label: "Fitness" },
    { emoji: "🦓", label: "Wellbeing" },
    { emoji: "🌊", label: "Friendship" },
    { emoji: "🌲", label: "Nature" },
    { emoji: "🤽", label: "Sports" },
  ],
};

export function BadgeCard() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvas = (ctx: CanvasRenderingContext2D, results: any) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, width, height);
    // canvas horizontal flip
    ctx.scale(-1, 1);
    ctx.translate(-width, 0);

    // Drawing captured image
    ctx.drawImage(results.image, 0, 0, width, height);
  };
  const renderPredictions = (predictions) => {
    const ctx = canvasRef?.current?.getContext("2d");
    if (!ctx) return;
    const pose = predictions?.[0].keypoints[0];
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Get the nose's x and y coordinates
    const x = pose.x;
    const y = pose.y;

    const radius = 5; // Change this value to adjust the circle's size
    const color = "#FF0000"; // Red color

    // Draw a circle on the nose's position
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();
  };

  const [imageSrc, setImageSrc] = useState<any>(null);
  const capture = useCallback(() => {
    const screenshot = webcamRef?.current?.getScreenshot();
    setImageSrc(screenshot);
    const img = document.getElementById("estimate");
    detector?.estimatePoses(img).then((poses) => {
      console.log(poses?.[0]);
      console.log(poses?.[0].keypoints.find((item) => item.name === "node"));
      renderPredictions(poses);
    });
  }, [webcamRef]);

  const model = Model.SupportedModels.BlazePose;
  const detectorConfig = {
    runtime: "tfjs",
    enableSmoothing: true,
    modelType: "full",
  };
  const [detector, setDetector] = useState<Model.PoseDetector>();
  useEffect(() => {
    (async () => {
      // await tf.ready();
      const detector = await Model.createDetector(model, detectorConfig);
      if (detector) {
        setDetector(detector);
      }
    })();
  }, []);

  const { image, title, description, country, badges } = mockdata;
  const features = badges.map((badge) => (
    <Badge variant="light" key={badge.label} leftSection={badge.emoji}>
      {badge.label}
    </Badge>
  ));

  return (
    <Card withBorder radius="md" p="md" className={classes.card}>
      <Card.Section className={classes.webcamSection}>
        <canvas ref={canvasRef} width="640" height="480" />
        {/* <Center>
        </Center> */}
      </Card.Section>

      <Card.Section className={classes.section} mt="md">
        <Group justify="apart">
          <Text fz="lg" fw={500}>
            Push up challenge
          </Text>
          <Badge size="sm" variant="light">
            Beginner
          </Badge>
        </Group>
        <Text fz="sm" mt="xs">
          Challenge a friend to do 10 push ups in a row and see who can do more.
          You can also challenge yourself and try to beat your own record.
        </Text>
      </Card.Section>

      <Card.Section className={classes.section}>
        <Text mt="md" className={classes.label} c="dimmed">
          Perfect for you, if you enjoy
        </Text>
        <Group gap={7} mt={5}>
          {features}
        </Group>
      </Card.Section>

      <Group mt="xs">
        <Button radius="md" style={{ flex: 1 }} onClick={capture}>
          Capture Photo
        </Button>

        <ActionIcon variant="default" radius="md" size={36}>
          <IconHeart className={classes.like} stroke={1.5} />
        </ActionIcon>
      </Group>
      <Group mt="xs">
        <Webcam
          style={{ visibility: "hidden" }}
          ref={webcamRef}
          mirrored={true}
          height={480}
          width={640}
          videoConstraints={{
            facingMode: "user",
          }}
        />
      </Group>
    </Card>
  );
}
