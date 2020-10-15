@echo off
setlocal
%~dp0\node.exe --no-deprecation %~dp0\sbol.js %*
