#!/usr/bin/env python3

import os
import sys
import board
import neopixel
import time
import json
import base64
import random

def clearBoard():
    for x in range(LEDs):
        ledWall[x] = (0, 0, 0)
    ledWall.show()

def log(msg):
   with open("doLed.log", "a") as logfile:
       logfile.write("%s\n" % msg) 

def wheel(pos):
   if pos < 85:
      return (pos * 3, 255 - pos * 3, 0)
   elif pos < 170:
      pos -= 85
      return (255 - pos * 3, 0, pos * 3)
   else:
      pos -= 170
      return (0, pos * 3, 255 - pos * 3)

LEDs = 228
ledWall = neopixel.NeoPixel(board.D18, LEDs, brightness=1, auto_write=False, pixel_order=neopixel.RGB)

clearBoard()

while True:

   ledWall.fill((255,0,0))
   ledWall.show()
   time.sleep(1)

   ledWall.fill((0,255,0))
   ledWall.show()
   time.sleep(1)

   ledWall.fill((0,0,255))
   ledWall.show()
   time.sleep(1)

   clearBoard()

   for i in range(LEDs):
      ledWall[i] = wheel(i)
      ledWall.show()
      time.sleep(0.05)
   
   clearBoard() 
   for x in range(10):
      for i in range(12):
         for j in range(19):
            ledWall[i*19 + j] = wheel(i * 21)
         ledWall.show()
         time.sleep(0.05)
      time.sleep(1)
      clearBoard()
