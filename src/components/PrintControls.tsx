import React from 'react'
import styled from 'styled-components'

const ControlsContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const ControlsTitle = styled.h2`
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.3rem;
`

const ControlGroup = styled.div`
  margin-bottom: 15px;
`

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-weight: 500;
`

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`

const Button = styled.button`
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &.primary {
    background-color: #4CAF50;
    color: white;
    
    &:hover {
      background-color: #45a049;
    }
  }
  
  &.secondary {
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    
    &:hover {
      background-color: #e8e8e8;
    }
  }
`

export const PrintControls: React.FC = () => {
  return (
    <ControlsContainer>
      <ControlsTitle>印刷設定</ControlsTitle>
      
      <ControlGroup>
        <Label htmlFor="paper-size">用紙サイズ</Label>
        <Select id="paper-size" defaultValue="A4">
          <option value="A4">A4</option>
          <option value="B5">B5</option>
        </Select>
      </ControlGroup>
      
      <ControlGroup>
        <Label htmlFor="grid-size">マス目サイズ</Label>
        <Select id="grid-size" defaultValue="medium">
          <option value="small">小 (15mm)</option>
          <option value="medium">中 (20mm)</option>
          <option value="large">大 (25mm)</option>
        </Select>
      </ControlGroup>
      
      <ControlGroup>
        <Label htmlFor="repetitions">繰り返し回数</Label>
        <Select id="repetitions" defaultValue="3">
          <option value="1">1回</option>
          <option value="3">3回</option>
          <option value="5">5回</option>
          <option value="10">10回</option>
        </Select>
      </ControlGroup>
      
      <ButtonGroup>
        <Button className="secondary">プレビュー更新</Button>
        <Button className="primary">印刷</Button>
      </ButtonGroup>
    </ControlsContainer>
  )
}