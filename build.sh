#!/bin/bash
rm -rf dist/
ng build --environment=prod --deploy-url=https://adashrod.github.io/LaserCutMazes
