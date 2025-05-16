import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import React from 'react'

interface ModalWrapperProps {
  title: string
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  onAction?: () => void
  actionText?: string
  buttonSize?: 'sm' | 'md' | 'lg'
  buttonCloseText?: string   //关闭按钮
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  title,
  children,
  isOpen,
  onClose,
  onAction,
  actionText = '确认',
  buttonSize = 'sm',
  buttonCloseText = '关闭'
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      isDismissable={false}
      isKeyboardDismissDisabled={false}
      backdrop={'blur'}
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
              {onAction && (
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
