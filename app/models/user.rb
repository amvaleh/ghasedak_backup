class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  # attr_accessible :phone_number
  has_many :comments
  attr_accessible :phone_number, :password, :password_confirmation
# devise :database_authenticatable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable #, :validatable 
  
  validates_uniqueness_of :phone_number
  validates_presence_of :password, :if => :encrypted_password_changed?
  validates_confirmation_of :password, :on=>:create
  validates_length_of :password, :within => Devise.password_length

end
