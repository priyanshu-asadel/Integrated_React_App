import cv2
from imutils.video import VideoStream

class VideoCamera(object):
    def __init__(self,z):
		# Using OpenCV to capture from device 0. If you have trouble capturing
		# from a webcam, comment the line below out and use a video file
		# instead.
        # self.video = cv2.VideoCapture("rtsp://ranu:Bharat1947@192.168.0.22/profile1/media.smp")
        #self.video = cv2.VideoCapture(0)
        self.video = VideoStream(z).start()
		# If you decide to use video.mp4, you must have this file in the folder
		# as the main.py.
		# self.video = cv2.VideoCapture('video.mp4')

    def __del__(self):
        self.video.stop()

    def get_frame(self):
        img = self.video.read()
        #img=cv2.resize(img,(640,480))
        if img is None:
            return None
        #boxes = face_recognition.face_locations(image, model='hog')
        #for box in boxes:
        #    [top, right, bot, left] = box
        #    cv2.rectangle(image, (left, top), (right, bot), (0, 0, 255), 1)

        # cv2.rectangle(image, (300,300), (600,600), (0,0,255), 1)
        # cv2.putText(image,"Ranu",(300,298),cv2.FONT_HERSHEY_SIMPLEX,1,(0,0,255),lineType=2)
        # We are using Motion JPEG, but OpenCV defaults to capture raw images,
        # so we must encode it into JPEG in order to correctly display the
        # video stream.
        ret, jpeg = cv2.imencode('.jpg', img)
        return jpeg.tobytes()
