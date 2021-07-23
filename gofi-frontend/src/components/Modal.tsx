import React from 'react'
import ReactDOM from 'react-dom'
import Button from './Button'
import ProgressBar from './ProgressBar'

interface IProps {
    show?: boolean
    buttons?: React.ReactNode[]
    message?: string | React.ReactNode
    title?: string
    showProgress?: boolean
    progress?: number
    totalProgress?: number
}

const defualtProps: IProps = {
    showProgress: false,
    progress: 0,
    totalProgress: 100,
}

const Modal: React.FC<IProps> = (props) => {
    return props.show
        ? ReactDOM.createPortal(
              <div className="transition-all animate-fadein fixed inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
                  <div className="card px-6 pt-6 pb-4 max-w-lg w-full border-gray-500 transition-all flex flex-row space-x-4">
                      {/* <div>
                          <div className="bg-red-100 rounded-full text-red-600 p-3 flex items-center justify-center">
                              <RiAlarmWarningFill />
                          </div>
                      </div> */}
                      <div className="flex flex-col space-y-2 w-full">
                          {/* title */}
                          {props.title ? (
                              <div className="font-semibold text-xl text-gray-700">{props.title}</div>
                          ) : null}
                          {props.showProgress ? (
                              <ProgressBar progress={props.progress} totalProgress={props.totalProgress} />
                          ) : null}
                          {/* message */}
                          {props.message ? <div>{props.message}</div> : null}
                          {/* button */}
                          {props.buttons ? (
                              <div className="pt-6 flex flex-row space-x-4 items-center justify-end">
                                  {props.buttons}
                              </div>
                          ) : null}
                      </div>
                  </div>
              </div>,
              document.querySelector('body')!,
          )
        : null
}

Modal.defaultProps = defualtProps

export default Modal
