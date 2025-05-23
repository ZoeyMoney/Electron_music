import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import React from 'react'

interface ModalWrapperProps {
  title: string
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  onAction?: () => void // 添加一个可选的 onAction 属性
  actionText?: string | null
  buttonSize?: 'sm' | 'md' | 'lg'
  buttonCloseText?: string //关闭按钮
  modalSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full'
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  title,
  children,
  isOpen,
  onClose,
  onAction,
  actionText,
  buttonSize = 'sm',
  buttonCloseText = '关闭',
  modalSize
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      isDismissable={false}
      isKeyboardDismissDisabled={false}
      backdrop={'blur'}
      size={modalSize}
    >
      <ModalContent>
        {(closeModal) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
            <ModalBody>{children}</ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={closeModal} size={buttonSize}>
                {buttonCloseText}
              </Button>
              {onAction && !!actionText && (
                <Button
                  color="primary"
                  size={buttonSize}
                  onPress={() => {
                    onAction?.()
                    closeModal()
                  }}
                >
                  {actionText}
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
